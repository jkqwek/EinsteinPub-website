import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertCircle,
  CheckCircle2,
  Edit2,
  Loader2,
  LogOut,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  categories,
  fetchMenu,
  formatPrice,
  type Category,
  type MenuItem,
} from "../menu"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const inputClass =
  "w-full bg-forest-dark border border-gold/20 rounded-lg px-3 py-2 text-offwhite outline-none focus:border-gold transition-all"
const labelClass = "text-offwhite-dim text-xs uppercase font-bold mb-1 block"

// ponytail: the password itself is the session, kept in sessionStorage until
// the tab closes; move to server-side sessions if the admin gets several users
const passwordKey = "adminPassword"

// Admin API call. The password goes as a bearer token, URI-encoded so a
// password in Cyrillic still fits in a header.
async function request(
  password: string,
  method: string,
  path: string,
  body?: File | object,
) {
  const res = await fetch(path, {
    method,
    headers: {
      Authorization: `Bearer ${encodeURIComponent(password)}`,
      "Content-Type": body instanceof File ? body.type : "application/json",
    },
    body: body instanceof File ? body : JSON.stringify(body),
  })
  if (!res.ok)
    throw Object.assign(new Error(`HTTP ${res.status}`), {
      status: res.status,
    })
  return res.status === 204 ? null : res.json()
}

const isUnauthorized = (err: unknown) =>
  (err as { status?: number }).status === 401

export function Admin() {
  const [password, setPassword] = useState(() =>
    sessionStorage.getItem(passwordKey),
  )

  const login = (value: string) => {
    sessionStorage.setItem(passwordKey, value)
    setPassword(value)
  }

  const logout = () => {
    sessionStorage.removeItem(passwordKey)
    setPassword(null)
  }

  return password ? (
    <MenuManager password={password} onLogout={logout} />
  ) : (
    <Login onLogin={login} />
  )
}

function Login({ onLogin }: { onLogin: (password: string) => void }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await request(password, "POST", "/api/login")
      onLogin(password)
    } catch (err) {
      setError(
        isUnauthorized(err)
          ? "Неверный пароль"
          : "Сервер недоступен, попробуйте позже",
      )
      setLoading(false)
    }
  }

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen flex items-center justify-center">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glassmorphism p-8 rounded-2xl w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-display text-gold text-center mb-6">
          Админ-панель
        </h1>
        <div>
          <label htmlFor="admin-password" className={labelClass}>
            Пароль
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        {error && (
          <p role="alert" className="text-red-400 text-sm">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold text-forest-dark font-bold uppercase py-3 rounded-lg hover:bg-gold-light transition-all flex justify-center"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Войти"}
        </button>
      </motion.form>
    </div>
  )
}

type Form = {
  name: string
  cat: Category
  price: string
  desc: string
  weight: string
  image: string
}

const emptyForm: Form = {
  name: "",
  cat: "Beers",
  price: "",
  desc: "",
  weight: "",
  image: "",
}

function MenuManager({
  password,
  onLogout,
}: {
  password: string
  onLogout: () => void
}) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState<"save" | "upload" | null>(null)
  const [toast, setToast] = useState<{
    msg: string
    type: "success" | "error"
  } | null>(null)

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetchMenu().then(setItems, () =>
      showToast("Не удалось загрузить меню", "error"),
    )
  }, [])

  // Runs an admin request; a rejected password sends the admin back to login
  const run = async (
    action: () => Promise<void>,
    success: string,
    failure: string,
  ) => {
    try {
      await action()
      showToast(success)
    } catch (err) {
      if (isUnauthorized(err)) onLogout()
      else showToast(failure, "error")
    }
  }

  const field =
    (name: keyof Form) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => {
      const value = e.target.value
      setForm((form) => ({ ...form, [name]: value }))
    }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id)
    setForm({ ...item, price: String(item.price) })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { name, cat, price, desc, weight, image } = form
    const body = { name, cat, price: Number(price), desc, weight, image }
    setBusy("save")
    await run(
      async () => {
        if (editingId) {
          const saved: MenuItem = await request(
            password,
            "PUT",
            `/api/menu/${editingId}`,
            body,
          )
          setItems((items) => items.map((i) => (i.id === saved.id ? saved : i)))
        } else {
          const saved: MenuItem = await request(
            password,
            "POST",
            "/api/menu",
            body,
          )
          setItems((items) => [...items, saved])
        }
        resetForm()
      },
      editingId ? "Позиция обновлена" : "Позиция добавлена",
      "Не удалось сохранить позицию",
    )
    setBusy(null)
  }

  const handleDelete = (item: MenuItem) => {
    if (!confirm(`Удалить «${item.name}» из меню?`)) return
    run(
      async () => {
        await request(password, "DELETE", `/api/menu/${item.id}`)
        setItems((items) => items.filter((i) => i.id !== item.id))
        if (editingId === item.id) resetForm()
      },
      "Позиция удалена",
      "Не удалось удалить позицию",
    )
  }

  const handleUpload = async (file: File) => {
    setBusy("upload")
    await run(
      async () => {
        const { url } = await request(password, "POST", "/api/uploads", file)
        setForm((form) => ({ ...form, image: url }))
      },
      "Фото загружено",
      "Не удалось загрузить фото: нужен JPG, PNG, WebP или GIF до 5 МБ",
    )
    setBusy(null)
  }

  return (
    <div className="pt-28 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
      <header className="flex justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-display text-offwhite">Управление меню</h1>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-offwhite hover:text-gold transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          Выйти
        </button>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="glassmorphism p-6 rounded-xl h-max">
          <h2 className="text-xl font-display text-gold mb-6">
            {editingId ? "Изменить позицию" : "Новая позиция"}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="item-name" className={labelClass}>
                Название
              </label>
              <input
                id="item-name"
                value={form.name}
                onChange={field("name")}
                maxLength={100}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="item-cat" className={labelClass}>
                Категория
              </label>
              <select
                id="item-cat"
                value={form.cat}
                onChange={field("cat")}
                className={inputClass}
              >
                {Object.entries(categories).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="item-price" className={labelClass}>
                Цена, ₽
              </label>
              <input
                id="item-price"
                type="number"
                inputMode="numeric"
                min={0}
                max={1000000}
                step={1}
                value={form.price}
                onChange={field("price")}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="item-weight" className={labelClass}>
                Граммовка / объём
              </label>
              <input
                id="item-weight"
                value={form.weight}
                onChange={field("weight")}
                maxLength={30}
                placeholder="500 мл или 350 г"
                className={cn(inputClass, "placeholder:text-offwhite-dim/40")}
              />
            </div>
            <div>
              <label htmlFor="item-desc" className={labelClass}>
                Описание
              </label>
              <textarea
                id="item-desc"
                value={form.desc}
                onChange={field("desc")}
                maxLength={500}
                className={cn(inputClass, "h-20 resize-none")}
              />
            </div>
            <div>
              <span className={labelClass}>Фото</span>
              {form.image ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                  <img
                    src={form.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image: "" })}
                    aria-label="Убрать фото"
                    title="Убрать фото"
                    className="absolute top-1 right-1 p-1 rounded-full bg-forest-dark/80 text-offwhite hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-gold/20 rounded-lg p-4 text-center cursor-pointer hover:bg-gold/5 focus-within:border-gold transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={busy !== null}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      e.target.value = ""
                      if (file) handleUpload(file)
                    }}
                  />
                  {busy === "upload" ? (
                    <Loader2
                      className="mx-auto text-gold mb-2 animate-spin"
                      size={24}
                    />
                  ) : (
                    <Upload className="mx-auto text-gold mb-2" size={24} />
                  )}
                  <span className="text-offwhite-dim text-sm">
                    Загрузить фото
                  </span>
                </label>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={busy !== null}
                className="flex-1 bg-gold text-forest-dark font-bold uppercase py-3 rounded-lg hover:bg-gold-light transition-all flex justify-center disabled:opacity-60"
              >
                {busy === "save" ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : editingId ? (
                  "Сохранить"
                ) : (
                  "Добавить"
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 border border-gold/30 text-offwhite rounded-lg hover:border-gold transition-colors"
                >
                  Отмена
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 glassmorphism rounded-xl overflow-x-auto h-max">
          <table className="w-full text-left">
            <thead className="bg-forest-light/50 text-offwhite-dim text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Название</th>
                <th className="px-6 py-4 font-medium">Категория</th>
                <th className="px-6 py-4 font-medium">Цена</th>
                <th className="px-6 py-4 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    "hover:bg-forest-light/30 transition-colors",
                    editingId === item.id && "bg-gold/5",
                  )}
                >
                  <td className="px-6 py-4 font-medium text-offwhite">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-offwhite-dim text-sm">
                    {categories[item.cat]}
                  </td>
                  <td className="px-6 py-4 text-gold font-bold whitespace-nowrap">
                    {formatPrice(item.price)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => startEdit(item)}
                        aria-label="Изменить"
                        title="Изменить"
                        className="text-offwhite-dim hover:text-gold transition-colors p-1"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        aria-label="Удалить"
                        title="Удалить"
                        className="text-offwhite-dim hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-offwhite-dim">
                    В меню пока нет позиций.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            role="status"
            className={cn(
              "fixed bottom-8 left-8 sm:left-auto right-8 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-50 font-bold",
              toast.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white",
            )}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={20} className="shrink-0" />
            ) : (
              <AlertCircle size={20} className="shrink-0" />
            )}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
