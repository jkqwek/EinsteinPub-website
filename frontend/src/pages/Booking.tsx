import React, { useState } from "react"
import { motion } from "framer-motion"
import { Check, Plus, Minus, Loader2, Sparkles } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// YYYY-MM-DD in the visitor's timezone (toISOString() would give the UTC date)
function todayLocal() {
  const d = new Date()
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

export function Booking() {
  const [guests, setGuests] = useState(2)
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")
  const [error, setError] = useState(false)

  const timeSlots = ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !time) {
      setError(true)
      setTimeout(() => setError(false), 800)
      return
    }

    setStatus("loading")
    setTimeout(() => {
      setStatus("success")
      window.scrollTo(0, 0)
    }, 1500)
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
            className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6 text-gold"
          >
            <Check size={40} />
          </motion.div>
          <h2 className="text-3xl font-display text-gold mb-4 relative inline-block">
            Стол забронирован
            <Sparkles className="absolute -top-6 -right-6 text-gold animate-pulse" />
          </h2>
          <p className="text-offwhite-dim mb-8">
            Ждём вас {formatDate(date)} в {time}. Количество гостей: {guests}.
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
                className="text-offwhite hover:text-gold transition-colors p-2"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="text-offwhite-dim text-sm uppercase font-bold mb-2 block">
                Дата
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={cn(
                  "w-full bg-forest-dark border rounded-lg px-4 py-3 text-offwhite outline-none focus:ring-1 focus:ring-gold transition-all",
                  error && !date
                    ? "border-red-500 animate-[shake_0.5s_ease-in-out]"
                    : "border-gold/20",
                )}
                min={todayLocal()}
              />
            </div>
            <div>
              <label className="text-offwhite-dim text-sm uppercase font-bold mb-2 block">
                Время
              </label>
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

          <div className="mb-8">
            <label className="text-offwhite-dim text-sm uppercase font-bold mb-2 block">
              Пожелания
            </label>
            <textarea
              className="w-full bg-forest-dark border border-gold/20 rounded-lg px-4 py-3 text-offwhite outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all h-24 resize-none"
              placeholder="Аллергии, предпочтения..."
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-gold text-forest-dark font-bold uppercase py-4 rounded-lg hover:bg-gold-light transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group"
          >
            {status === "loading" ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <span>Подтвердить бронь</span>
            )}
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </button>
        </form>
      </motion.div>
    </div>
  )
}
