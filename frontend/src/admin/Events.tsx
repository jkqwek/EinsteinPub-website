import { useEffect, useState, type FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Plus, Pencil, Trash2, X, Eye, EyeOff, Calendar, Image as ImageIcon } from "lucide-react"
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
  starts_at: string
  description: string
  is_published: boolean
  imageFile: File | null
}

function isoToLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function localInputToIso(value: string): string {
  return new Date(value).toISOString()
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Moscow",
  })
}

const emptyForm: FormState = { title: "", starts_at: "", description: "", is_published: true, imageFile: null }

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

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null); setForm(emptyForm); setCreating(true)
  }

  function openEdit(ev: AdminEvent) {
    setCreating(false); setEditing(ev)
    setForm({
      title: ev.title, starts_at: isoToLocalInput(ev.starts_at), description: ev.description, is_published: ev.is_published, imageFile: null,
    })
  }

  function closeModal() {
    setCreating(false); setEditing(null); setForm(emptyForm)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const fd = new FormData()
      fd.append("title", form.title)
      fd.append("starts_at", localInputToIso(form.starts_at))
      fd.append("description", form.description)
      fd.append("is_published", String(form.is_published))
      if (form.imageFile) fd.append("image", form.imageFile)

      const url = editing ? `/api/admin/events/${editing.id}/` : "/api/admin/events/"
      const method = editing ? "PATCH" : "POST"

      const res = await adminFetch(url, { method, body: fd })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const flat = Object.values(body).flat() as string[]
        throw new Error(flat[0] || "Не удалось сохранить")
      }
      closeModal(); await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(ev: AdminEvent) {
    if (!confirm(`Удалить «${ev.title}»?`)) return
    try {
      const res = await adminFetch(`/api/admin/events/${ev.id}/`, { method: "DELETE" })
      if (!res.ok && res.status !== 204) throw new Error("Не удалось удалить")
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления")
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display text-gold mb-2">События</h1>
          <p className="text-offwhite-dim text-sm">Управление афишей паба.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-gold text-forest-dark font-bold text-xs px-5 py-3 rounded-xl hover:bg-gold-light transition-all">
          <Plus size={16} /> Добавить событие
        </button>
      </header>

      {error && <div className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">{error}</div>}

      {!events && !error && <Loader2 className="mx-auto text-gold animate-spin my-12" size={32} />}
      
      {events && events.length === 0 && (
        <div className="text-center py-20 bg-forest-dark/30 border border-gold/10 rounded-2xl">
          <Calendar size={48} className="mx-auto text-gold/30 mb-4" />
          <p className="text-offwhite-dim">Пока нет событий. Нажми «Добавить», чтобы создать первое.</p>
        </div>
      )}

      {events && events.length > 0 && (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className="group flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-forest-dark/30 border border-gold/10 hover:border-gold/30 hover:bg-forest-dark/50 transition-all duration-200">
              
              <div className="w-16 h-16 rounded-xl bg-forest border border-gold/10 shrink-0 overflow-hidden">
                {ev.image ? (
                  <img src={ev.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-offwhite-dim/30"><ImageIcon size={24} /></div>
                )}
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-offwhite truncate">{ev.title}</h3>
                  {ev.is_published ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <Eye size={10} /> Опубликовано
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-offwhite-dim bg-forest px-2 py-0.5 rounded border border-gold/10">
                      <EyeOff size={10} /> Скрыто
                    </span>
                  )}
                </div>
                <div className="text-sm text-gold font-display">{formatDateTime(ev.starts_at)}</div>
              </div>

              <div className="flex gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(ev)} className="p-2.5 text-offwhite-dim hover:text-gold bg-forest rounded-xl transition-all"><Pencil size={18} /></button>
                <button onClick={() => onDelete(ev)} className="p-2.5 text-offwhite-dim hover:text-red-400 bg-forest rounded-xl transition-all"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модалка */}
      <AnimatePresence>
        { (creating || editing) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-forest-dark/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={closeModal}>
            <motion.form initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} onSubmit={onSubmit} className="bg-forest-dark border border-gold/20 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-5 my-8">
              
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-display text-gold">{editing ? "Редактировать событие" : "Новое событие"}</h2>
                <button type="button" onClick={closeModal} className="p-2 text-offwhite-dim hover:text-gold bg-forest-light/5 rounded-lg transition-colors"><X size={20} /></button>
              </div>

              <div>
                <label className="block text-sm text-offwhite-dim mb-1.5">Название *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-forest border border-gold/20 rounded-xl px-4 py-2.5 text-offwhite focus:border-gold outline-none" />
              </div>

              <div>
                <label className="block text-sm text-offwhite-dim mb-1.5">Дата и время *</label>
                <input required type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="w-full bg-forest border border-gold/20 rounded-xl px-4 py-2.5 text-offwhite focus:border-gold outline-none [color-scheme:dark]" />
              </div>

              <div>
                <label className="block text-sm text-offwhite-dim mb-1.5">Описание</label>
                <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-forest border border-gold/20 rounded-xl px-4 py-2.5 text-offwhite focus:border-gold outline-none resize-y" />
              </div>

              <div>
                <label className="block text-sm text-offwhite-dim mb-1.5">Фото {editing?.image && ""}</label>
                {editing?.image && !form.imageFile && <img src={editing.image} alt="" className="w-full h-40 object-cover rounded-xl mb-3 border border-gold/10" />}
                <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] ?? null })} className="w-full text-sm text-offwhite-dim file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:uppercase file:bg-gold/10 file:text-gold hover:file:bg-gold hover:file:text-forest-dark file:cursor-pointer file:transition-all border border-gold/20 rounded-xl bg-forest p-2" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none bg-forest/50 p-3 rounded-xl border border-gold/10 hover:border-gold/30 transition-all">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-5 h-5 accent-gold rounded" />
                <span className="text-sm text-offwhite font-medium">Опубликовано (видно на сайте)</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold uppercase tracking-wide text-sm bg-gold text-forest-dark hover:bg-gold-light transition-all disabled:opacity-60">
                  {saving && <Loader2 className="animate-spin" size={16} />} {editing ? "Сохранить" : "Создать"}
                </button>
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl font-bold uppercase tracking-wide text-sm border border-gold/20 text-offwhite-dim hover:text-offwhite transition-all">Отмена</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}