import { useEffect, useState, type FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Plus, Pencil, Trash2, X, Eye, EyeOff, Briefcase } from "lucide-react"
import { adminFetch } from "./api"

type AdminVacancy = {
  id: number
  title: string
  description: string
  schedule: string
  salary: string
  is_open: boolean
  sort_order: number
}

type FormState = Omit<AdminVacancy, "id">

const emptyForm: FormState = { title: "", description: "", schedule: "", salary: "", is_open: true, sort_order: 0 }
const fieldClass = "w-full bg-forest border border-gold/20 rounded-xl px-4 py-2.5 text-offwhite focus:border-gold outline-none"

// Error text for a failed admin request; 403 means the user is staff but not an administrator
async function errorText(res: Response, fallback: string) {
  if (res.status === 403) return "Раздел доступен только администраторам."
  const body = await res.json().catch(() => ({}))
  return (Object.values(body).flat()[0] as string) || fallback
}

export function AdminVacancies() {
  const [vacancies, setVacancies] = useState<AdminVacancy[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<AdminVacancy | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setError(null)
    try {
      const res = await adminFetch("/api/admin/vacancies/")
      if (!res.ok) throw new Error(await errorText(res, "Не удалось загрузить вакансии"))
      setVacancies(await res.json())
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

  function openEdit(v: AdminVacancy) {
    const { id: _, ...rest } = v
    setCreating(false); setEditing(v); setForm(rest)
  }

  function closeModal() {
    setCreating(false); setEditing(null); setForm(emptyForm)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const url = editing ? `/api/admin/vacancies/${editing.id}/` : "/api/admin/vacancies/"
      const res = await adminFetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await errorText(res, "Не удалось сохранить"))
      closeModal(); await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(v: AdminVacancy) {
    if (!confirm(`Удалить вакансию «${v.title}»? Отклики на неё останутся.`)) return
    try {
      const res = await adminFetch(`/api/admin/vacancies/${v.id}/`, { method: "DELETE" })
      if (!res.ok) throw new Error(await errorText(res, "Не удалось удалить"))
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления")
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display text-gold mb-2">Вакансии</h1>
          <p className="text-offwhite-dim text-sm">Открытые вакансии видны на странице «Вакансии». Закрытая скрыта с сайта.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-gold text-forest-dark font-bold text-xs px-5 py-3 rounded-xl hover:bg-gold-light transition-all">
          <Plus size={16} /> Добавить вакансию
        </button>
      </header>

      {error && <div className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">{error}</div>}
      {!vacancies && !error && <Loader2 className="mx-auto text-gold animate-spin my-12" size={32} />}

      {vacancies && vacancies.length === 0 && (
        <div className="text-center py-20 bg-forest-dark/30 border border-gold/10 rounded-2xl">
          <Briefcase size={48} className="mx-auto text-gold/30 mb-4" />
          <p className="text-offwhite-dim">Вакансий пока нет. Без них на сайте всё равно можно оставить резюме «на будущее».</p>
        </div>
      )}

      {vacancies && vacancies.length > 0 && (
        <div className="space-y-3">
          {vacancies.map((v) => (
            <div key={v.id} className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-forest-dark/30 border border-gold/10 hover:border-gold/30 hover:bg-forest-dark/50 transition-all duration-200">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-offwhite truncate">{v.title}</h3>
                  {v.is_open ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <Eye size={10} /> Открыта
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-offwhite-dim bg-forest px-2 py-0.5 rounded border border-gold/10">
                      <EyeOff size={10} /> Закрыта
                    </span>
                  )}
                </div>
                <div className="text-sm text-offwhite-dim">{[v.salary, v.schedule].filter(Boolean).join(", ") || "Без графика и зарплаты"}</div>
              </div>
              <div className="flex gap-2 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button onClick={() => openEdit(v)} aria-label="Изменить" className="p-2.5 text-offwhite-dim hover:text-gold bg-forest rounded-xl transition-all"><Pencil size={18} /></button>
                <button onClick={() => onDelete(v)} aria-label="Удалить" className="p-2.5 text-offwhite-dim hover:text-red-400 bg-forest rounded-xl transition-all"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {(creating || editing) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-forest-dark/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={closeModal}>
            <motion.form initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} onSubmit={onSubmit} className="bg-forest-dark border border-gold/20 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-5 my-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-display text-gold">{editing ? "Редактировать вакансию" : "Новая вакансия"}</h2>
                <button type="button" onClick={closeModal} aria-label="Закрыть" className="p-2 text-offwhite-dim hover:text-gold bg-forest-light/5 rounded-lg transition-colors"><X size={20} /></button>
              </div>

              <div>
                <label htmlFor="vacancy-title" className="block text-sm text-offwhite-dim mb-1.5">Должность *</label>
                <input id="vacancy-title" required maxLength={100} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={fieldClass} placeholder="Бармен" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="vacancy-salary" className="block text-sm text-offwhite-dim mb-1.5">Зарплата</label>
                  <input id="vacancy-salary" maxLength={100} value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className={fieldClass} placeholder="от 60 000 ₽ + чаевые" />
                </div>
                <div>
                  <label htmlFor="vacancy-schedule" className="block text-sm text-offwhite-dim mb-1.5">График</label>
                  <input id="vacancy-schedule" maxLength={100} value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} className={fieldClass} placeholder="2/2, с 15:00" />
                </div>
              </div>

              <div>
                <label htmlFor="vacancy-description" className="block text-sm text-offwhite-dim mb-1.5">Описание</label>
                <textarea id="vacancy-description" rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${fieldClass} resize-y`} placeholder="Обязанности, требования, что предлагаем" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer select-none bg-forest/50 p-3 rounded-xl border border-gold/10 hover:border-gold/30 transition-all">
                  <input type="checkbox" checked={form.is_open} onChange={(e) => setForm({ ...form, is_open: e.target.checked })} className="w-5 h-5 accent-gold rounded" />
                  <span className="text-sm text-offwhite font-medium">Открыта (видна на сайте)</span>
                </label>
                <div>
                  <label htmlFor="vacancy-order" className="block text-sm text-offwhite-dim mb-1.5">Порядок на странице</label>
                  <input id="vacancy-order" type="number" min={0} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className={fieldClass} />
                </div>
              </div>

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
