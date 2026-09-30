// Einstein Pub API: the menu (anyone reads it, the admin edits it) and photo uploads.
// No dependencies. Data lives in DATA_DIR (default ./data): menu.json and uploads/.
//
//   cp .env.example .env   # set ADMIN_PASSWORD
//   pnpm start             # http://localhost:3000; the frontend proxies /api and /uploads here
//   pnpm test
import { createServer } from "node:http"
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs"
import { createHash, randomUUID, timingSafeEqual } from "node:crypto"
import { join } from "node:path"

const {
  PORT = 3000,
  ADMIN_PASSWORD,
  DATA_DIR = join(import.meta.dirname, "data"),
} = process.env
if (!ADMIN_PASSWORD) throw new Error("ADMIN_PASSWORD is not set, see .env.example")

const menuFile = join(DATA_DIR, "menu.json")
const uploadsDir = join(DATA_DIR, "uploads")
mkdirSync(uploadsDir, { recursive: true })

// Keep in sync with categories in frontend/src/menu.ts
const categories = ["Beers", "Cocktails", "Wines", "Mains"]
const imageTypes = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
}
const maxUploadBytes = 5 * 1024 * 1024

let items = existsSync(menuFile)
  ? JSON.parse(readFileSync(menuFile, "utf8"))
  : seedMenu()

// Sync write + rename: requests can't interleave writes, and a crash never
// leaves a half-written menu.json
function saveMenu() {
  writeFileSync(menuFile + ".tmp", JSON.stringify(items, null, 2))
  renameSync(menuFile + ".tmp", menuFile)
}

// The client sends "Bearer " + encodeURIComponent(password). Comparing hashes
// gives timingSafeEqual the equal lengths it needs.
// ponytail: no rate limit on password guesses; add nginx limit_req on /api/ in production
const sha256 = (s) => createHash("sha256").update(s).digest()
const adminToken = sha256(`Bearer ${encodeURIComponent(ADMIN_PASSWORD)}`)
const isAdmin = (req) =>
  timingSafeEqual(sha256(req.headers.authorization ?? ""), adminToken)

const httpError = (status) =>
  Object.assign(new Error(`HTTP ${status}`), { status })

function send(res, status, body) {
  if (body === undefined) return res.writeHead(status).end()
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" })
  res.end(JSON.stringify(body))
}

async function readBody(req, limit) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    if ((size += chunk.length) > limit) throw httpError(413)
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

// Validates an item from the admin form and returns the fields to store
async function readItem(req) {
  const { name, cat, price, desc = "", weight = "", image = "" } =
    JSON.parse(await readBody(req, 64 * 1024)) ?? {}
  const valid =
    typeof name === "string" &&
    name.trim() !== "" &&
    name.length <= 100 &&
    categories.includes(cat) &&
    Number.isInteger(price) &&
    price >= 0 &&
    price <= 1_000_000 &&
    typeof desc === "string" &&
    desc.length <= 500 &&
    typeof weight === "string" &&
    weight.length <= 30 &&
    typeof image === "string" &&
    image.length <= 500 &&
    (image === "" || /^(\/uploads\/|https:\/\/)/.test(image))
  if (!valid) throw httpError(400)
  return {
    name: name.trim(),
    cat,
    price,
    desc: desc.trim(),
    weight: weight.trim(),
    image,
  }
}

function sendUpload(res, name) {
  // Only names this server generates: no slashes, no dots besides the extension
  const ext = name.match(/^[\w-]+\.(jpg|png|webp|gif)$/)?.[1]
  const file = join(uploadsDir, name)
  if (!ext || !existsSync(file)) throw httpError(404)
  res.writeHead(200, {
    "Content-Type": imageTypes[ext],
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "public, max-age=31536000, immutable",
  })
  createReadStream(file).pipe(res)
}

createServer(async (req, res) => {
  try {
    const path = new URL(req.url, "http://localhost").pathname
    const id = path.match(/^\/api\/menu\/([\w-]+)$/)?.[1]

    if (req.method === "GET" && path === "/api/menu")
      return send(res, 200, items)
    if (req.method === "GET" && path.startsWith("/uploads/"))
      return sendUpload(res, path.slice("/uploads/".length))
    if (!path.startsWith("/api/")) throw httpError(404)
    if (!isAdmin(req)) throw httpError(401)

    if (req.method === "POST" && path === "/api/login") return send(res, 204)

    if (req.method === "POST" && path === "/api/uploads") {
      const ext = Object.keys(imageTypes).find(
        (e) => imageTypes[e] === req.headers["content-type"],
      )
      if (!ext) throw httpError(415)
      const name = `${randomUUID()}.${ext}`
      writeFileSync(join(uploadsDir, name), await readBody(req, maxUploadBytes))
      return send(res, 201, { url: `/uploads/${name}` })
    }

    if (req.method === "POST" && path === "/api/menu") {
      const item = { id: randomUUID(), ...(await readItem(req)) }
      items.push(item)
      saveMenu()
      return send(res, 201, item)
    }

    if (req.method === "PUT" && id) {
      const fields = await readItem(req)
      // Look the item up after the await: it may have been deleted meanwhile
      const index = items.findIndex((i) => i.id === id)
      if (index === -1) throw httpError(404)
      items[index] = { id, ...fields }
      saveMenu()
      return send(res, 200, items[index])
    }

    if (req.method === "DELETE" && id) {
      const count = items.length
      items = items.filter((i) => i.id !== id)
      if (items.length === count) throw httpError(404)
      saveMenu()
      return send(res, 204)
    }

    throw httpError(404)
  } catch (err) {
    const status = err.status ?? (err instanceof SyntaxError ? 400 : 500)
    if (status === 500) console.error(err)
    if (!res.headersSent) send(res, status)
  }
}).listen(PORT, () => console.log(`API on http://localhost:${PORT}`))

// First run: start from the menu the site launched with
function seedMenu() {
  return [
    {
      name: "Квантовый IPA",
      cat: "Beers",
      price: 450,
      desc: "Хмелевой, с цитрусовыми нотами, 6,5% алк.",
      weight: "500 мл",
      image:
        "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Стаут «Относительность»",
      cat: "Beers",
      price: 490,
      desc: "Тёмный шоколад, жжёный солод, 8% алк.",
      weight: "500 мл",
      image:
        "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Алхимик",
      cat: "Cocktails",
      price: 750,
      desc: "Джин, бузина, дымящийся розмарин",
      weight: "250 мл",
      image:
        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Кот Шрёдингера",
      cat: "Cocktails",
      price: 790,
      desc: "Бурбон, биттеры, загадочное послевкусие",
      weight: "150 мл",
      image:
        "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Свинина «Яблоко Ньютона»",
      cat: "Mains",
      price: 1290,
      desc: "Томлёная свиная грудинка, яблочное пюре",
      weight: "350 г",
      image:
        "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=300&q=80",
    },
  ].map((item) => ({ id: randomUUID(), ...item }))
}
