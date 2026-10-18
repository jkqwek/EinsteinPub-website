import { useEffect, useState, type FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { adminFetch } from "./api"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Photo = { id: number; image: string; caption: string; sort_order: number }
type PhotoForm = { caption: string; sort_order: number; imageFile: File | null }
const emptyForm: PhotoForm = { caption: "", sort_order: 0, imageFile: null }

export function AdminGallery() {
  const [photos, setPhotos] = useState<Photo[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<{ open: boolean; editing: Photo | null }>({ open: false, editing: null })
  const [form, setForm] = useState<PhotoForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setError(null)
    try {
      const res = await adminFetch("/api/admin/gallery/")
      if (!res.ok) throw new Error("Не удалось загрузить галерею")
      setPhotos(await res.json())
    } catch (e) {
      if (e instanceof Error && e.message === "SESSION_EXPIRED") { window.location.href = "/admin/login"; return }
      setError(e instanceof Error ? e.message : "Ошибка")
    }
  }

  useEffect(() => { load() }, [])

  function openCreate() { setForm(emptyForm); setModal({ open: true, editing: null }) }
  function openEdit(p: Photo) { setForm({ caption: p.caption, sort_order: p.sort_order, imageFile: null }); setModal({ open: true, editing: p }) }
  function closeModal() { setModal({ open: false, editing: null }); setForm(emptyForm) }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const fd = new FormData()
      fd.append("caption", form.caption)
      fd.append("sort_order", String(form.sort_order))
      if (form.imageFile) fd.append("image", form.imageFile)
      if (!modal.editing && !form.imageFile) throw new Error("Выберите файл изображения.")

      const url = modal.editing ? `/api/admin/gallery/${modal.editing.id}/` : "/api/admin/gallery/"
      const method = modal.editing ? "PATCH" : "POST"

      const res = await adminFetch(url, { method, body: fd })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const flat = Object.values(body).flat() as string[]
        throw new Error(flat[0] || "Не удалось сохранить")
      }
      closeModal(); await load()
    } catch (err) { setError(err instanceof Error ? err.message : "Ошибка") } finally { setSaving(false) }
  }

  async function onDelete(p: Photo) {
    if (!confirm(`Удалить фото?`)) return
    try {
      const res = await adminFetch(`/api/admin/gallery/${p.id}/`, { method: "DELETE" })
      if (!res.ok && res.status !== 204) throw new Error("Не удалось удалить")
      await load()
    } catch (err) { setError(err instanceof Error ? err.message : "Ошибка") }
  }

  async function move(index: number, direction: -1 | 1) {
    if (!photos) return
    const target = index + direction
    if (target < 0 || target >= photos.length) return

    const newPhotos = [...photos]
    const temp = newPhotos[index]
    newPhotos[index] = newPhotos[target]
    newPhotos[target] = temp

    const promises = newPhotos.map((photo, i) => {
      if (photo.sort_order === i) return Promise.resolve()
      return adminFetch(`/api/admin/gallery/${photo.id}/`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sort_order: i }),
      })
    })
    await Promise.all(promises)
    await load()
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display text-gold mb-2">Галерея</h1>
          <p className="text-offwhite-dim text-sm">Управление фотографиями на сайте.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-gold text-forest-dark font-bold text-xs px-5 py-3 rounded-xl hover:bg-gold-light transition-all">
          <Plus size={16} /> Добавить фото
        </button>
      </header>

      {error && <div className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">{error}</div>}

      {!photos && !error && <Loader2 className="mx-auto text-gold animate-spin my-12" size={32} />}

      {photos && photos.length === 0 && (
        <div className="text-center py-20 bg-forest-dark/30 border border-gold/10 rounded-2xl">
          <ImageIcon size={48} className="mx-auto text-gold/30 mb-4" />
          <p className="text-offwhite-dim">Пока нет фото. Нажми «Добавить», чтобы загрузить первое.</p>
        </div>
      )}

      {photos && photos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {photos.map((p, i) => (
            <motion.div key={p.id} layout className="group rounded-2xl overflow-hidden bg-forest-dark/30 border border-gold/10 relative aspect-[4/3] hover:border-gold/30 transition-all">
              <img src={p.image} alt={p.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => openEdit(p)} className="p-2 bg-forest-dark/80 backdrop-blur-md text-offwhite hover:text-gold rounded-lg transition-colors"><Pencil size={14} /></button>
                <button onClick={() => onDelete(p)} className="p-2 bg-forest-dark/80 backdrop-blur-md text-offwhite hover:text-red-400 rounded-lg transition-colors"><Trash2 size={14} /></button>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                <p className="text-sm text-white font-medium truncate drop-shadow-md">{p.caption || "Без подписи"}</p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 bg-forest-dark/80 backdrop-blur-md text-offwhite hover:text-gold disabled:opacity-30 rounded-md"><ChevronLeft size={14} /></button>
                  <button onClick={() => move(i, 1)} disabled={i === photos.length - 1} className="p-1.5 bg-forest-dark/80 backdrop-blur-md text-offwhite hover:text-gold disabled:opacity-30 rounded-md"><ChevronRight size={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Модалка */}
      <AnimatePresence>
        {modal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-forest-dark/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeModal}>
            <motion.form initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} onSubmit={onSubmit} className="bg-forest-dark border border-gold/20 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-display text-gold">{modal.editing ? "Редактировать фото" : "Новое фото"}</h2>
                <button type="button" onClick={closeModal} className="p-2 text-offwhite-dim hover:text-gold bg-forest-light/5 rounded-lg transition-colors"><X size={20} /></button>
              </div>

              {modal.editing?.image && !form.imageFile && <img src={modal.editing.image} alt="" className="w-full h-48 object-cover rounded-xl mb-3 border border-gold/10" />}

              <div>
                <label className="block text-sm text-offwhite-dim mb-1.5">Файл {modal.editing ? "" : "*"}</label>
                <input type="file" accept="image/*" required={!modal.editing} onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] ?? null })} className="w-full text-sm text-offwhite-dim file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:uppercase file:bg-gold/10 file:text-gold hover:file:bg-gold hover:file:text-forest-dark file:cursor-pointer file:transition-all border border-gold/20 rounded-xl bg-forest p-2" />
              </div>

              <div>
                <label className="block text-sm text-offwhite-dim mb-1.5">Подпись</label>
                <input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="Например: Бар в пятницу вечером" className="w-full bg-forest border border-gold/20 rounded-xl px-4 py-2.5 text-offwhite focus:border-gold outline-none" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold uppercase tracking-wide text-sm bg-gold text-forest-dark hover:bg-gold-light transition-all disabled:opacity-60">
                  {saving && <Loader2 className="animate-spin" size={16} />} {modal.editing ? "Сохранить" : "Загрузить"}
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