import { test, after } from "node:test"
import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const port = 3999
const base = `http://localhost:${port}`
const password = "пароль"
const server = spawn(process.execPath, ["server.js"], {
  cwd: import.meta.dirname,
  env: {
    ...process.env,
    PORT: port,
    ADMIN_PASSWORD: password,
    DATA_DIR: mkdtempSync(join(tmpdir(), "einstein-")),
  },
  stdio: ["ignore", "ignore", "inherit"],
})
after(() => server.kill())

const auth = { Authorization: `Bearer ${encodeURIComponent(password)}` }
const call = (method, path, body, headers = auth) =>
  fetch(base + path, {
    method,
    headers: { ...headers, "Content-Type": "application/json" },
    body: body && JSON.stringify(body),
  })

test("menu: public read, admin-only edits, uploads", async () => {
  for (let i = 0; ; i++) {
    try {
      await fetch(base)
      break
    } catch (err) {
      if (i > 50) throw err
      await new Promise((r) => setTimeout(r, 100))
    }
  }

  const menu = () => fetch(base + "/api/menu").then((r) => r.json())
  assert.equal((await menu()).length, 5)

  assert.equal((await call("POST", "/api/login", undefined, {})).status, 401)
  const wrong = { Authorization: "Bearer wrong" }
  assert.equal((await call("POST", "/api/login", undefined, wrong)).status, 401)
  assert.equal((await call("POST", "/api/login")).status, 204)

  const item = { name: "Тест", cat: "Beers", price: 100, desc: "", image: "" }
  for (const bad of [
    { ...item, cat: "Soup" },
    { ...item, price: -1 },
    { ...item, name: " " },
    { ...item, weight: "x".repeat(31) },
    { ...item, image: "javascript:alert(1)" },
  ])
    assert.equal((await call("POST", "/api/menu", bad)).status, 400)

  const created = await (await call("POST", "/api/menu", item)).json()
  assert.equal((await menu()).length, 6)
  const updated = await call("PUT", `/api/menu/${created.id}`, {
    ...item,
    price: 200,
    weight: " 500 мл ",
  })
  assert.deepEqual(await updated.json(), {
    ...item,
    id: created.id,
    price: 200,
    weight: "500 мл",
  })
  assert.equal((await call("DELETE", `/api/menu/${created.id}`)).status, 204)
  assert.equal((await call("DELETE", `/api/menu/${created.id}`)).status, 404)
  assert.equal((await menu()).length, 5)

  const upload = await fetch(base + "/api/uploads", {
    method: "POST",
    headers: { ...auth, "Content-Type": "image/png" },
    body: new Uint8Array([1, 2, 3]),
  })
  const { url } = await upload.json()
  const photo = await fetch(base + url)
  assert.equal(photo.headers.get("content-type"), "image/png")
  assert.equal((await fetch(base + "/uploads/..%2Fmenu.json")).status, 404)
})
