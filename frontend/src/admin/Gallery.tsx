import { useEffect, useState, type FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { adminFetch } from "./api"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Photo = {
  id: number
  image: string
  caption: string
  sort_order: number
}

type PhotoForm = {
  caption: string
  sort_order: number
  imageFile: File | null
}

const emptyForm: PhotoForm = {
  caption: "",
  sort_order: 0,
  imageFile: null,
}

export function AdminGallery() {
  const [photos, setPhotos] = useState<Photo[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<{ open: boolean; editing: Photo | null }>({
    open: false,
    editing: null,
  })
  const [form, setForm] = useState<PhotoForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setError(null)
    try {
      const res = await adminFetch("/api/admin/gallery/")
      if (!res.ok) throw new Error("Не удалось загрузить галерею")
      setPhotos(await res.json())
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
    setForm(emptyForm)
    setModal({ open: true, editing: null })
  }

  function openEdit(p: Photo) {
    setForm({ caption: p.caption, sort_order: p.sort_order, imageFile: null })
    setModal({ open: true, editing: p })
  }

  function closeModal() {
    setModal({ open: false, editing: null })
    setForm(emptyForm)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("caption", form.caption)
      fd.append("sort_order", String(form.sort_order))
      if (form.imageFile) fd.append("image", form.imageFile)

      // При создании фото обязательно
      if (!modal.editing && !form.imageFile) {
        throw new Error("Выберите файл изображения.")
      }

      const url = modal.editing
        ? `/api/admin/gallery/${modal.editing.id}/`
        : "/api/admin/gallery/"
      const method = modal.editing ? "PATCH" : "POST"

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

  async function onDelete(p: Photo) {
    const label = p.caption || `Фото #${p.id}`
    if (!confirm(`Удалить «${label}»? Действие необратимо.`)) return
    try {
      const res = await adminFetch(`/api/admin/gallery/${p.id}/`, {
        method: "DELETE",
      })
      if (!res.ok && res.status !== 204) throw new Error("Не удалось удалить")
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления")
    }
  }

  async function move(index: number, direction: -1 | 1) {
    if (!photos) return
    const target = index + direction
    if (target < 0 || target >= photos.length) return
    const a = photos[index]
    const b = photos[target]
    await Promise.all([
      adminFetch(`/api/admin/gallery/${a.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: b.sort_order }),
      }),
      adminFetch(`/api/admin/gallery/${b.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: a.sort_order }),
      }),
    ])
    await load()
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display text-gold mb-1">Галерея</h1>
          <p className="text-offwhite-dim text-sm">
            Фотографии для страницы «Галерея». Стрелки ← → меняют порядок.
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

      {!photos && !error && (
        <Loader2 className="mx-auto text-gold animate-spin my-12" size={32} />
      )}

      {photos && photos.length === 0 && (
        <p className="text-offwhite-dim text-center py-16">
          Пока нет фото. Нажми «Добавить», чтобы загрузить первое.
        </p>
      )}

      {photos && photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group glassmorphism rounded-lg overflow-hidden relative"
            >
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={p.image}
                  alt={p.caption}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Действия поверх фото */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(p)}
                    className="p-1.5 bg-forest-dark/80 rounded-sm text-offwhite hover:text-gold"
                    title="Редактировать"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(p)}
                    className="p-1.5 bg-forest-dark/80 rounded-sm text-offwhite hover:text-red-400"
                    title="Удалить"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Стрелки порядка */}
                <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="p-1.5 bg-forest-dark/80 rounded-sm text-offwhite hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Влево"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === photos.length - 1}
                    className="p-1.5 bg-forest-dark/80 rounded-sm text-offwhite hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Вправо"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {p.caption && (
                <div className="p-3">
                  <p className="text-sm text-offwhite truncate">{p.caption}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Модалка */}
      <AnimatePresence>
        {modal.open && (
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
              className="glassmorphism rounded-xl p-6 w-full max-w-md space-y-4 my-8"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-display text-gold">
                  {modal.editing ? "Редактировать фото" : "Новое фото"}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 text-offwhite-dim hover:text-gold"
                >
                  <X size={20} />
                </button>
              </div>

              {modal.editing?.image && !form.imageFile && (
                <img
                  src={modal.editing.image}
                  alt=""
                  className="w-full h-40 object-cover rounded-sm"
                />
              )}

              <div>
                <label className="block text-sm text-offwhite-dim mb-1">
                  Файл{" "}
                  {modal.editing
                    ? "(оставь пустым, чтобы не менять)"
                    : "*"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required={!modal.editing}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      imageFile: e.target.files?.[0] ?? null,
                    })
                  }
                  className="w-full text-sm text-offwhite-dim file:mr-3 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-bold file:uppercase file:bg-gold file:text-forest-dark hover:file:bg-gold-light file:cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm text-offwhite-dim mb-1">
                  Подпись
                </label>
                <input
                  value={form.caption}
                  onChange={(e) =>
                    setForm({ ...form, caption: e.target.value })
                  }
                  placeholder="Например: Бар в пятницу вечером"
                  className="w-full bg-forest-dark/60 border border-gold/20 rounded-sm px-3 py-2 text-offwhite focus:border-gold outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm font-bold uppercase text-sm bg-gold text-forest-dark hover:bg-gold-light transition-colors disabled:opacity-60"
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  {modal.editing ? "Сохранить" : "Загрузить"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 rounded-sm font-bold uppercase text-sm border border-gold/30 text-offwhite-dim hover:text-offwhite"
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