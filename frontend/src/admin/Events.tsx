import { useEffect, useState, type FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  EyeOff,
} from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { adminFetch } from "./api"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type AdminEvent = {
  id: number
  title: string
  starts_at: string
  description: string
  image: string
  is_published: boolean
}

type FormState = {
  title: string
  starts_at: string // для input[type=datetime-local]: "YYYY-MM-DDTHH:MM"
  description: string
  is_published: boolean
  imageFile: File | null
}

// ISO string -> значение для <input type="datetime-local"> в локальной зоне
function isoToLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}

// "2026-10-15T19:00" (локальное) -> ISO с offset
function localInputToIso(value: string): string {
  return new Date(value).toISOString()
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  })
}

const emptyForm: FormState = {
  title: "",
  starts_at: "",
  description: "",
  is_published: true,
  imageFile: null,
}

export function AdminEvents() {
  const [events, setEvents] = useState<AdminEvent[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<AdminEvent | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setError(null)
    try {
      const res = await adminFetch("/api/admin/events/")
      if (!res.ok) throw new Error("Не удалось загрузить события")
      setEvents(await res.json())
    } catch (e) {
      if (e instanceof Error && e.message === "SESSION_EXPIRED") {
        window.location.href = "/admin/login"
        return
      }
      setError(e instanceof Error ? e.message : "Ошибка")
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setCreating(true)
  }

  function openEdit(ev: AdminEvent) {
    setCreating(false)
    setEditing(ev)
    setForm({
      title: ev.title,
      starts_at: isoToLocalInput(ev.starts_at),
      description: ev.description,
      is_published: ev.is_published,
      imageFile: null,
    })
  }

  function closeModal() {
    setCreating(false)
    setEditing(null)
    setForm(emptyForm)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("title", form.title)
      fd.append("starts_at", localInputToIso(form.starts_at))
      fd.append("description", form.description)
      fd.append("is_published", String(form.is_published))
      if (form.imageFile) fd.append("image", form.imageFile)

      const url = editing
        ? `/api/admin/events/${editing.id}/`
        : "/api/admin/events/"
      const method = editing ? "PATCH" : "POST"

      const res = await adminFetch(url, { method, body: fd })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const flat = Object.values(body).flat() as string[]
        throw new Error(flat[0] || "Не удалось сохранить")
      }
      closeModal()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(ev: AdminEvent) {
    if (!confirm(`Удалить «${ev.title}»? Это действие необратимо.`)) return
    try {
      const res = await adminFetch(`/api/admin/events/${ev.id}/`, {
        method: "DELETE",
      })
      if (!res.ok && res.status !== 204) throw new Error("Не удалось удалить")
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления")
    }
  }

  const modalOpen = creating || Boolean(editing)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-gold mb-1">События</h1>
          <p className="text-offwhite-dim text-sm">
            Управление афишей. Опубликованные события появляются на сайте.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gold text-forest-dark font-bold uppercase text-sm px-4 py-2 rounded-sm hover:bg-gold-light transition-colors"
        >
          <Plus size={16} /> Добавить
        </button>
      </header>

      {error && (
        <div className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-sm px-4 py-3">
          {error}
        </div>
      )}

      {!events && !error && (
        <Loader2 className="mx-auto text-gold animate-spin" size={32} />
      )}

      {events && events.length === 0 && (
        <p className="text-offwhite-dim text-center py-16">
          Пока нет событий. Нажми «Добавить», чтобы создать первое.
        </p>
      )}

      {events && events.length > 0 && (
        <div className="glassmorphism rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-forest-dark/60 text-offwhite-dim uppercase text-xs">
              <tr>
                <th className="text-left px-4 py-3">Дата</th>
                <th className="text-left px-4 py-3">Название</th>
                <th className="text-left px-4 py-3">Статус</th>
                <th className="text-right px-4 py-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr
                  key={ev.id}
                  className="border-t border-gold/10 hover:bg-forest-dark/40 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-offwhite-dim">
                    {formatDateTime(ev.starts_at)}
                  </td>
                  <td className="px-4 py-3 text-offwhite">{ev.title}</td>
                  <td className="px-4 py-3">
                    {ev.is_published ? (
                      <span className="inline-flex items-center gap-1 text-xs text-gold">
                        <Eye size={12} /> Опубликовано
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-offwhite-dim">
                        <EyeOff size={12} /> Скрыто
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => openEdit(ev)}
                      className="p-2 text-offwhite-dim hover:text-gold transition-colors"
                      title="Редактировать"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(ev)}
                      className="p-2 text-offwhite-dim hover:text-red-400 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Модалка создания/редактирования */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-forest-dark/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={onSubmit}
              className="glassmorphism rounded-xl p-6 w-full max-w-2xl space-y-4 my-8"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-display text-gold">
                  {editing ? "Редактировать событие" : "Новое событие"}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 text-offwhite-dim hover:text-gold transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div>
                <label className="block text-sm text-offwhite-dim mb-1">
                  Название *
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-forest-dark/60 border border-gold/20 rounded-sm px-3 py-2 text-offwhite focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-offwhite-dim mb-1">
                  Дата и время *
                </label>
                <input
                  required
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) =>
                    setForm({ ...form, starts_at: e.target.value })
                  }
                  className="w-full bg-forest-dark/60 border border-gold/20 rounded-sm px-3 py-2 text-offwhite focus:border-gold outline-none [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-sm text-offwhite-dim mb-1">
                  Описание
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full bg-forest-dark/60 border border-gold/20 rounded-sm px-3 py-2 text-offwhite focus:border-gold outline-none resize-y"
                />
              </div>

              <div>
                <label className="block text-sm text-offwhite-dim mb-1">
                  Фото {editing?.image && "(оставь пустым, чтобы не менять)"}
                </label>
                {editing?.image && !form.imageFile && (
                  <img
                    src={editing.image}
                    alt=""
                    className="w-full h-32 object-cover rounded-sm mb-2"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      imageFile: e.target.files?.[0] ?? null,
                    })
                  }
                  className="w-full text-sm text-offwhite-dim file:mr-3 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-bold file:uppercase file:bg-gold file:text-forest-dark hover:file:bg-gold-light file:cursor-pointer"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) =>
                    setForm({ ...form, is_published: e.target.checked })
                  }
                  className="w-4 h-4 accent-gold"
                />
                <span className="text-sm text-offwhite">
                  Опубликовано (видно на сайте)
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm font-bold uppercase text-sm transition-colors",
                    "bg-gold text-forest-dark hover:bg-gold-light",
                    saving && "opacity-60 cursor-not-allowed",
                  )}
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  {editing ? "Сохранить" : "Создать"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 rounded-sm font-bold uppercase text-sm border border-gold/30 text-offwhite-dim hover:text-offwhite hover:border-gold/60 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}