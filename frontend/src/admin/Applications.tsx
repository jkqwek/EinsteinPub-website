import { useEffect, useState } from "react"
import { Loader2, Phone, Mail, Briefcase, Download, Trash2, FileText } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { adminFetch } from "./api"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Status = "new" | "reviewed" | "invited" | "rejected"
type Application = {
  id: number; position: string; name: string; phone: string; email: string; about: string;
  resume_name: string; status: Status; created_at: string;
}

const STATUS_LABELS: Record<Status, string> = { new: "Новый", reviewed: "Рассмотрен", invited: "Приглашён", rejected: "Отказ" }
// Button text for moving an application into each status
const STATUS_ACTIONS: Record<Status, string> = { new: "В новые", reviewed: "Рассмотрен", invited: "Пригласить", rejected: "Отказать" }
const STATUS_COLORS: Record<Status, string> = {
  new: "text-gold bg-gold/10 border-gold/20",
  reviewed: "text-sky-300 bg-sky-500/10 border-sky-500/20",
  invited: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  rejected: "text-red-400 bg-red-500/10 border-red-500/20",
}

const FILTERS: { id: Status | "all"; label: string }[] = [
  { id: "all", label: "Все" }, { id: "new", label: "Новые" }, { id: "reviewed", label: "Рассмотренные" },
  { id: "invited", label: "Приглашённые" }, { id: "rejected", label: "Отказы" },
]

function formatCreated(iso: string) { return new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) }

export function AdminApplications() {
  const [filter, setFilter] = useState<Status | "all">("all")
  const [applications, setApplications] = useState<Application[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  // Runs an admin request; 403 means the user is staff but not an administrator
  async function request(path: string, init: RequestInit, fallback: string) {
    try {
      const res = await adminFetch(path, init)
      if (res.status === 403) throw new Error("Раздел доступен только администраторам.")
      if (!res.ok) throw new Error(fallback)
      return res
    } catch (e) {
      if (e instanceof Error && e.message === "SESSION_EXPIRED") window.location.href = "/admin/login"
      throw e
    }
  }

  async function load() {
    setError(null); setApplications(null)
    const url = filter === "all" ? "/api/admin/applications/" : `/api/admin/applications/?status=${filter}`
    try {
      const res = await request(url, {}, "Не удалось загрузить отклики")
      setApplications(await res.json())
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка") }
  }

  useEffect(() => { load() }, [filter])

  async function act(a: Application, action: () => Promise<void>) {
    setBusyId(a.id); setError(null)
    try { await action() } catch (e) { setError(e instanceof Error ? e.message : "Ошибка") } finally { setBusyId(null) }
  }

  const setStatus = (a: Application, status: Status) => act(a, async () => {
    const res = await request(`/api/admin/applications/${a.id}/`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    }, "Не удалось обновить статус")
    const updated: Application = await res.json()
    setApplications((prev) => prev && prev.map((x) => (x.id === a.id ? updated : x)))
  })

  // The file comes through the authorized API, so it is saved via a temporary blob link
  const downloadResume = (a: Application) => act(a, async () => {
    const res = await request(`/api/admin/applications/${a.id}/resume/`, {}, "Не удалось скачать резюме")
    const url = URL.createObjectURL(await res.blob())
    const link = document.createElement("a")
    link.href = url
    link.download = `Резюме ${a.name}${a.resume_name.slice(a.resume_name.lastIndexOf("."))}`
    link.click()
    URL.revokeObjectURL(url)
  })

  const remove = (a: Application) => {
    if (!confirm(`Удалить отклик ${a.name} вместе с файлом резюме? Это нельзя отменить.`)) return
    act(a, async () => {
      await request(`/api/admin/applications/${a.id}/`, { method: "DELETE" }, "Не удалось удалить отклик")
      setApplications((prev) => prev && prev.filter((x) => x.id !== a.id))
    })
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-display text-gold mb-2">Отклики</h1>
        <p className="text-offwhite-dim text-sm">Резюме с сайта. Видны только администраторам.</p>
      </header>

      <div className="flex flex-wrap gap-2 mb-8 bg-forest-dark/30 p-2 rounded-2xl border border-gold/10 w-max max-w-full">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={cn("px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all", filter === f.id ? "bg-gold text-forest-dark shadow-md" : "text-offwhite-dim hover:text-offwhite hover:bg-forest-light/5")}>
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">{error}</div>}
      {!applications && !error && <Loader2 className="mx-auto text-gold animate-spin my-12" size={32} />}

      {applications && applications.length === 0 && (
        <div className="text-center py-20 bg-forest-dark/30 border border-gold/10 rounded-2xl">
          <FileText size={48} className="mx-auto text-gold/30 mb-4" />
          <p className="text-offwhite-dim">Пока нет откликов в этой категории.</p>
        </div>
      )}

      {applications && applications.length > 0 && (
        <div className="space-y-4">
          {applications.map((a) => (
            <article key={a.id} className="bg-forest-dark/30 border border-gold/10 rounded-2xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start hover:border-gold/20 transition-all">
              <div className="space-y-4 min-w-0">
                <div className="flex flex-wrap items-center gap-3 border-b border-gold/10 pb-3">
                  <h3 className="text-xl font-display text-offwhite">{a.name}</h3>
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border", STATUS_COLORS[a.status])}>
                    {STATUS_LABELS[a.status]}
                  </span>
                  <span className="text-xs text-offwhite-dim ml-auto">Отклик: {formatCreated(a.created_at)}</span>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-offwhite-dim font-medium">
                  <span className="flex items-center gap-2 bg-forest px-3 py-1.5 rounded-lg border border-gold/10"><Briefcase size={16} className="text-gold" /> {a.position || "Любая вакансия"}</span>
                  <a href={`tel:${a.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 bg-gold/10 text-gold hover:bg-gold/20 px-3 py-1.5 rounded-lg border border-gold/20 transition-colors"><Phone size={16} /> {a.phone}</a>
                  {a.email && <a href={`mailto:${a.email}`} className="flex items-center gap-2 bg-forest hover:text-gold px-3 py-1.5 rounded-lg border border-gold/10 transition-colors"><Mail size={16} className="text-gold" /> {a.email}</a>}
                  {a.resume_name && (
                    <button onClick={() => downloadResume(a)} disabled={busyId === a.id} className="flex items-center gap-2 bg-forest hover:text-gold px-3 py-1.5 rounded-lg border border-gold/10 transition-colors disabled:opacity-50">
                      <Download size={16} className="text-gold" /> Скачать резюме
                    </button>
                  )}
                </div>

                {a.about && <p className="text-sm text-offwhite-dim whitespace-pre-line border-l-2 border-gold/30 pl-3 py-1">{a.about}</p>}
              </div>

              <div className="flex flex-row flex-wrap md:flex-col gap-2 md:items-stretch w-full md:w-auto">
                {(Object.keys(STATUS_ACTIONS) as Status[]).filter((s) => s !== a.status).map((s) => (
                  <button key={s} onClick={() => setStatus(a, s)} disabled={busyId === a.id} className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all disabled:opacity-50 hover:brightness-125", STATUS_COLORS[s])}>
                    {STATUS_ACTIONS[s]}
                  </button>
                ))}
                <button onClick={() => remove(a)} disabled={busyId === a.id} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide bg-forest text-offwhite-dim border border-gold/10 hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-50">
                  <Trash2 size={14} /> Удалить
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
