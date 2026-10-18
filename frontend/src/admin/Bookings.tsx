import { useEffect, useState } from "react"
import { Loader2, Phone, Users, Calendar, Clock, Check, X as XIcon, RotateCcw, ClipboardList } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { adminFetch } from "./api"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type BookingStatus = "new" | "confirmed" | "cancelled"
type Booking = {
  id: number; name: string; phone: string; guests: number; date: string; time: string;
  wishes: string; status: BookingStatus; status_display: string; created_at: string;
}

const STATUS_LABELS: Record<BookingStatus, string> = { new: "Новая", confirmed: "Подтверждена", cancelled: "Отменена" }
const STATUS_COLORS: Record<BookingStatus, string> = {
  new: "text-gold bg-gold/10 border-gold/20",
  confirmed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  cancelled: "text-red-400 bg-red-500/10 border-red-500/20",
}

const FILTERS: { id: BookingStatus | "all"; label: string }[] = [
  { id: "all", label: "Все" }, { id: "new", label: "Новые" }, { id: "confirmed", label: "Подтверждённые" }, { id: "cancelled", label: "Отменённые" },
]

function formatDate(date: string) { const [y, m, d] = date.split("-"); return `${d}.${m}.${y}` }
function formatTime(time: string) { return time.slice(0, 5) }
function formatCreated(iso: string) { return new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) }

export function AdminBookings() {
  const [filter, setFilter] = useState<BookingStatus | "all">("all")
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  async function load() {
    setError(null); setBookings(null)
    try {
      const url = filter === "all" ? "/api/admin/bookings/" : `/api/admin/bookings/?status=${filter}`
      const res = await adminFetch(url)
      if (!res.ok) throw new Error("Не удалось загрузить брони")
      setBookings(await res.json())
    } catch (e) {
      if (e instanceof Error && e.message === "SESSION_EXPIRED") { window.location.href = "/admin/login"; return }
      setError(e instanceof Error ? e.message : "Ошибка")
    }
  }

  useEffect(() => { load() }, [filter])

  async function setStatus(b: Booking, status: BookingStatus) {
    setUpdatingId(b.id); setError(null)
    try {
      const res = await adminFetch(`/api/admin/bookings/${b.id}/`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Не удалось обновить статус")
      const updated: Booking = await res.json()
      setBookings((prev) => prev ? prev.map((x) => (x.id === b.id ? updated : x)) : prev)
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка") } finally { setUpdatingId(null) }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-display text-gold mb-2">Брони</h1>
        <p className="text-offwhite-dim text-sm">Заявки с сайта. Позвони гостю и обнови статус.</p>
      </header>

      <div className="flex flex-wrap gap-2 mb-8 bg-forest-dark/30 p-2 rounded-2xl border border-gold/10 w-max">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={cn("px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all", filter === f.id ? "bg-gold text-forest-dark shadow-md" : "text-offwhite-dim hover:text-offwhite hover:bg-forest-light/5")}>
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">{error}</div>}
      {!bookings && !error && <Loader2 className="mx-auto text-gold animate-spin my-12" size={32} />}

      {bookings && bookings.length === 0 && (
        <div className="text-center py-20 bg-forest-dark/30 border border-gold/10 rounded-2xl">
          <ClipboardList size={48} className="mx-auto text-gold/100 mb-4 drop-shadow-md" />
          <p className="text-offwhite-dim">Пока нет заявок в этой категории.</p>
        </div>
      )}

      {bookings && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((b) => (
            <article key={b.id} className="bg-forest-dark/30 border border-gold/10 rounded-2xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start hover:border-gold/20 transition-all">
              
              <div className="space-y-4 min-w-0">
                <div className="flex flex-wrap items-center gap-3 border-b border-gold/10 pb-3">
                  <h3 className="text-xl font-display text-offwhite">{b.name}</h3>
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border", STATUS_COLORS[b.status])}>
                    {STATUS_LABELS[b.status]}
                  </span>
                  <span className="text-xs text-offwhite-dim ml-auto">Заявка: {formatCreated(b.created_at)}</span>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-offwhite-dim font-medium">
                  <span className="flex items-center gap-2 bg-forest px-3 py-1.5 rounded-lg border border-gold/10"><Calendar size={16} className="text-gold" /> {formatDate(b.date)}</span>
                  <span className="flex items-center gap-2 bg-forest px-3 py-1.5 rounded-lg border border-gold/10"><Clock size={16} className="text-gold" /> {formatTime(b.time)}</span>
                  <span className="flex items-center gap-2 bg-forest px-3 py-1.5 rounded-lg border border-gold/10"><Users size={16} className="text-gold" /> {b.guests} гостей</span>
                  <a href={`tel:${b.phone.replace(/\D/g, "")}`} className="flex items-center gap-2 bg-gold/10 text-gold hover:bg-gold/20 px-3 py-1.5 rounded-lg border border-gold/20 transition-colors"><Phone size={16} /> {b.phone}</a>
                </div>

                {b.wishes && <p className="text-sm text-offwhite-dim italic border-l-2 border-gold/30 pl-3 py-1">«{b.wishes}»</p>}
              </div>

              <div className="flex flex-row md:flex-col gap-2 md:items-stretch w-full md:w-auto">
                {b.status !== "confirmed" && (
                  <button onClick={() => setStatus(b, "confirmed")} disabled={updatingId === b.id} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                    {updatingId === b.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Подтвердить
                  </button>
                )}
                {b.status !== "cancelled" && (
                  <button onClick={() => setStatus(b, "cancelled")} disabled={updatingId === b.id} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50">
                    <XIcon size={14} /> Отменить
                  </button>
                )}
                {b.status !== "new" && (
                  <button onClick={() => setStatus(b, "new")} disabled={updatingId === b.id} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide bg-forest text-offwhite-dim border border-gold/10 hover:text-offwhite hover:border-gold/30 transition-all disabled:opacity-50">
                    <RotateCcw size={14} /> В новые
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}