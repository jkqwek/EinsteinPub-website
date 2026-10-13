import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { formatEventDate, useApi, type PubEvent } from "../api"

// Event card for the Events page and the "upcoming events" block on Home.
// `full` shows the whole description (there are no separate event pages).
export function EventCard({
  event,
  index,
  full = false,
}: {
  event: PubEvent
  index: number
  full?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 3) * 0.1 }}
      className="group glassmorphism rounded-lg overflow-hidden hover:shadow-[0_12px_40px_-8px_rgba(97,24,32,0.7)] transition-shadow duration-300"
    >
      {event.image && (
        <div className="h-48 overflow-hidden relative">
          <div className="absolute inset-0 bg-forest/20 group-hover:bg-transparent transition-colors z-10" />
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
      )}
      <div className="p-6">
        <div className="inline-block bg-burgundy text-gold-light text-sm font-bold px-2 py-0.5 rounded-sm mb-2">
          {formatEventDate(event.starts_at)}
        </div>
        <h3 className="text-xl font-display mb-2 break-words hyphens-auto group-hover:text-gold transition-colors">
          {event.title}
        </h3>
        {event.description && (
          <p
            className={
              full
                ? "text-offwhite-dim text-sm whitespace-pre-line"
                : "text-offwhite-dim text-sm line-clamp-2"
            }
          >
            {event.description}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export function Events() {
  const { data: events, failed } = useApi<PubEvent[]>("/api/events/")

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-display text-gold mb-4">
          СОБЫТИЯ
        </h1>
        <p className="text-offwhite-dim">
          Особые вечера для ценителей вкуса и хорошей мысли.
        </p>
      </motion.div>

      {!events && !failed && (
        <Loader2 className="mx-auto text-gold animate-spin" size={32} />
      )}
      {(failed || events?.length === 0) && (
        <p className="text-center text-offwhite-dim">
          {failed
            ? "Не удалось загрузить события. Попробуйте обновить страницу."
            : "Скоро здесь появятся события."}
        </p>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {events?.map((event, i) => (
          <EventCard key={event.id} event={event} index={i} full />
        ))}
      </div>
    </div>
  )
}
