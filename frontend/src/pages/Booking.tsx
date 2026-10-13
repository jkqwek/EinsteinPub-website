import React, { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Check, Plus, Minus, Loader2, Sparkles } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createBooking } from "../api"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Same limits as backend/apps/bookings/views.py
const timeSlots = ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00"]
const maxDaysAhead = 60

// YYYY-MM-DD in the visitor's timezone, `days` from today
// (toISOString() would give the UTC date)
function localDate(days = 0) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// "2026-09-20" -> "20 сентября"
function formatDate(value: string) {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  })
}

const inputClass =
  "w-full bg-forest-dark border border-gold/20 rounded-lg px-4 py-3 text-offwhite outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
const labelClass = "text-offwhite-dim text-sm uppercase font-bold mb-2 block"

export function Booking() {
  const [guests, setGuests] = useState(2)
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [wishes, setWishes] = useState("")
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")
  const [error, setError] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !time) {
      setError(true)
      setTimeout(() => setError(false), 800)
      return
    }

    setStatus("loading")
    setMessage("")
    try {
      await createBooking({ name, phone, guests, date, time, wishes, consent })
      setStatus("success")
      window.scrollTo(0, 0)
    } catch (err) {
      setMessage((err as Error).message)
      setStatus("idle")
    }
  }

  if (status === "success") {
    return (
      <div className="pt-32 pb-24 px-6 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glassmorphism p-12 rounded-2xl text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-burgundy ring-4 ring-burgundy/30 rounded-full flex items-center justify-center mx-auto mb-6 text-gold"
          >
            <Check size={40} />
          </motion.div>
          <h2 className="text-3xl font-display text-gold mb-4 relative inline-block">
            Заявка принята
            <Sparkles className="absolute -top-6 -right-6 text-gold animate-pulse" />
          </h2>
          <p className="text-offwhite-dim mb-8">
            {formatDate(date)} в {time}, гостей: {guests}. Мы перезвоним по
            номеру {phone}, чтобы подтвердить бронь.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="px-6 py-2 border border-gold text-gold rounded hover:bg-gold/10 transition-colors"
          >
            Забронировать ещё
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display text-gold mb-4">
            БРОНЬ СТОЛА
          </h1>
          <p className="text-offwhite-dim">
            Займите место на вечер интеллекта и изысканного вкуса.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glassmorphism p-8 rounded-2xl border border-gold/10"
        >
          <div className="mb-8 flex flex-col items-center">
            <label className="text-offwhite-dim text-sm uppercase font-bold mb-4 block">
              Количество гостей
            </label>
            <div className="flex items-center gap-6 glassmorphism px-4 py-2 rounded-full border border-gold/20">
              <button
                type="button"
                onClick={() => setGuests(Math.max(1, guests - 1))}
                aria-label="Меньше гостей"
                className="text-offwhite hover:text-gold transition-colors p-2"
              >
                <Minus size={20} />
              </button>
              <span className="text-2xl font-display font-bold w-8 text-center text-gold">
                {guests}
              </span>
              <button
                type="button"
                onClick={() => setGuests(Math.min(12, guests + 1))}
                aria-label="Больше гостей"
                className="text-offwhite hover:text-gold transition-colors p-2"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="booking-date" className={labelClass}>
                Дата
              </label>
              <input
                id="booking-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={cn(
                  inputClass,
                  error && !date
                    ? "border-red-500 animate-[shake_0.5s_ease-in-out]"
                    : "border-gold/20",
                )}
                min={localDate()}
                max={localDate(maxDaysAhead)}
              />
            </div>
            <div>
              <label className={labelClass}>Время</label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={cn(
                      "py-2 text-sm rounded-lg border transition-all duration-300 font-medium",
                      time === t
                        ? "border-gold bg-gold text-forest-dark"
                        : "border-gold/20 text-offwhite hover:border-gold/50",
                      error &&
                        !time &&
                        "border-red-500 animate-[shake_0.5s_ease-in-out]",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="booking-name" className={labelClass}>
                Имя
              </label>
              <input
                id="booking-name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="booking-phone" className={labelClass}>
                Телефон
              </label>
              <input
                id="booking-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+7 (900) 000-00-00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={30}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="mb-8">
            <label htmlFor="booking-wishes" className={labelClass}>
              Пожелания
            </label>
            <textarea
              id="booking-wishes"
              value={wishes}
              onChange={(e) => setWishes(e.target.value)}
              maxLength={1000}
              className={cn(inputClass, "h-24 resize-none")}
              placeholder="Аллергии, предпочтения..."
            />
          </div>

          <label className="flex items-start gap-3 mb-8 text-sm text-offwhite-dim cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 accent-gold"
              required
            />
            <span>
              Соглашаюсь на обработку персональных данных согласно{" "}
              <Link
                to="/privacy"
                target="_blank"
                className="text-gold underline hover:text-gold-light"
              >
                политике конфиденциальности
              </Link>
            </span>
          </label>

          {message && (
            <p role="alert" className="text-red-400 text-sm text-center mb-4">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-gold text-forest-dark font-bold uppercase py-4 rounded-lg hover:bg-gold-light transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group"
          >
            {status === "loading" ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <span>Отправить заявку</span>
            )}
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </button>
        </form>
      </motion.div>
    </div>
  )
}
