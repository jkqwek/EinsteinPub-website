import { useEffect, useState } from "react"
import {
  Loader2,
  Phone,
  Users,
  Calendar,
  Clock,
  Check,
  X as XIcon,
  RotateCcw,
} from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { adminFetch } from "./api"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type BookingStatus = "new" | "confirmed" | "cancelled"

type Booking = {
  id: number
  name: string
  phone: string
  guests: number
  date: string // YYYY-MM-DD
  time: string // HH:MM:SS
  wishes: string
  status: BookingStatus
  status_display: string
  created_at: string
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  new: "Новая",
  confirmed: "Подтверждена",
  cancelled: "Отменена",
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  new: "text-gold bg-gold/10 border-gold/40",
  confirmed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/40",
  cancelled: "text-red-400 bg-red-500/10 border-red-500/40",
}

const FILTERS: { id: BookingStatus | "all"; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "new", label: "Новые" },
  { id: "confirmed", label: "Подтверждённые" },
  { id: "cancelled", label: "Отменённые" },
]

function formatDate(date: string) {
  // "2026-10-15" -> "15.10.2026"
  const [y, m, d] = date.split("-")
  return `${d}.${m}.${y}`
}

function formatTime(time: string) {
  // "19:00:00" -> "19:00"
  return time.slice(0, 5)
}

function formatCreated(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function AdminBookings() {
  const [filter, setFilter] = useState<BookingStatus | "all">("all")
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  async function load() {
    setError(null)
    setBookings(null)
    try {
      const url =
        filter === "all"
          ? "/api/admin/bookings/"
          : `/api/admin/bookings/?status=${filter}`
      const res = await adminFetch(url)
      if (!res.ok) throw new Error("Не удалось загрузить брони")
      setBookings(await res.json())
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
  }, [filter])

  async function setStatus(b: Booking, status: BookingStatus) {
    setUpdatingId(b.id)
    setError(null)
    try {
      const res = await adminFetch(`/api/admin/bookings/${b.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Не удалось обновить статус")
      const updated: Booking = await res.json()
      setBookings((prev) =>
        prev ? prev.map((x) => (x.id === b.id ? updated : x)) : prev,
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-display text-gold mb-1">Брони</h1>
        <p className="text-offwhite-dim text-sm">
          Заявки с сайта. Позвони гостю и подтверди бронь — статус обновится здесь.
        </p>
      </header>

      {/* Фильтр */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-bold uppercase transition-colors",
              filter === f.id
                ? "bg-gold text-forest-dark"
                : "glassmorphism text-offwhite-dim hover:text-gold",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-sm px-4 py-3">
          {error}
        </div>
      )}

      {!bookings && !error && (
        <Loader2 className="mx-auto text-gold animate-spin my-12" size={32} />
      )}

      {bookings && bookings.length === 0 && (
        <p className="text-offwhite-dim text-center py-16">
          {filter === "all"
            ? "Пока нет ни одной брони."
            : `Нет броней со статусом «${STATUS_LABELS[filter as BookingStatus]}».`}
        </p>
      )}

      {bookings && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((b) => (
            <article
              key={b.id}
              className="glassmorphism rounded-lg p-4 md:p-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start"
            >
              <div className="space-y-3 min-w-0">
                {/* Заголовок: имя + статус */}
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-display text-offwhite">
                    {b.name}
                  </h3>
                  <span
                    className={cn(
                      "text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-sm border",
                      STATUS_COLORS[b.status],
                    )}
                  >
                    {STATUS_LABELS[b.status]}
                  </span>
                  <span className="text-xs text-offwhite-dim ml-auto">
                    создана {formatCreated(b.created_at)}
                  </span>
                </div>

                {/* Детали брони */}
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-offwhite-dim">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-gold" />
                    {formatDate(b.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-gold" />
                    {formatTime(b.time)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={14} className="text-gold" />
                    {b.guests} {b.guests === 1 ? "гость" : "гостей"}
                  </span>
                  <a
                    href={`tel:${b.phone.replace(/\D/g, "")}`}
                    className="flex items-center gap-1.5 text-gold hover:text-gold-light transition-colors"
                  >
                    <Phone size={14} />
                    {b.phone}
                  </a>
                </div>

                {b.wishes && (
                  <p className="text-sm text-offwhite-dim italic border-l-2 border-gold/30 pl-3">
                    {b.wishes}
                  </p>
                )}
              </div>

              {/* Кнопки смены статуса */}
              <div className="flex flex-wrap md:flex-col gap-2 md:items-stretch">
                {b.status !== "confirmed" && (
                  <button
                    onClick={() => setStatus(b, "confirmed")}
                    disabled={updatingId === b.id}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-sm text-xs font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                  >
                    {updatingId === b.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    Подтвердить
                  </button>
                )}
                {b.status !== "cancelled" && (
                  <button
                    onClick={() => setStatus(b, "cancelled")}
                    disabled={updatingId === b.id}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-sm text-xs font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    <XIcon size={14} />
                    Отменить
                  </button>
                )}
                {b.status !== "new" && (
                  <button
                    onClick={() => setStatus(b, "new")}
                    disabled={updatingId === b.id}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-sm text-xs font-bold uppercase text-offwhite-dim border border-gold/20 hover:text-offwhite hover:border-gold/40 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw size={14} />
                    Вернуть в новые
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