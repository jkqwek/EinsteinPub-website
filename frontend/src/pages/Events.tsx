import { motion } from "framer-motion"
import { Loader2, Clock, CalendarX } from "lucide-react"
import { formatEventDate, useApi, type PubEvent } from "../api"

export function EventCard({ 
  event, 
  isPast = false, 
  index = 0 
}: { 
  event: PubEvent; 
  isPast?: boolean; 
  index?: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 3) * 0.1 }}
      className={`group flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 ${
        isPast 
          ? "bg-forest-dark/30 border-gold/10 opacity-75 hover:opacity-100" 
          : "bg-forest-dark/50 border-gold/20 hover:border-gold/50 hover:shadow-[0_12px_40px_-8px_rgba(97,24,32,0.8)]"
      }`}
    >
      {event.image && (
        <div className="relative aspect-[16/9] overflow-hidden border-b-2 border-gold/20">
          <img
            src={event.image}
            alt={event.title}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isPast ? "grayscale group-hover:scale-105" : "group-hover:scale-110"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {isPast ? (
            <div className="absolute top-3 right-3 bg-burgundy text-gold-light text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm shadow-lg">
              Событие прошло
            </div>
          ) : (
            <div className="absolute top-3 left-3 bg-gold text-forest-dark text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm shadow-md">
              Скоро
            </div>
          )}
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="inline-block text-gold text-sm font-bold uppercase tracking-wider mb-2">
          {formatEventDate(event.starts_at)}
        </div>
        <h3 className={`text-xl font-display font-bold mb-3 transition-colors ${
          isPast ? "text-offwhite-dim" : "text-offwhite group-hover:text-gold"
        }`}>
          {event.title}
        </h3>
        {event.description && (
          <p className="text-offwhite-dim text-sm leading-relaxed line-clamp-3">
            {event.description}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export function Events() {
  const { data: events, loading, failed } = useApi<PubEvent[]>("/api/events/")

  const now = new Date()
  const futureEvents = events?.filter(e => new Date(e.starts_at) >= now) || []
  const pastEvents = events?.filter(e => new Date(e.starts_at) < now).sort((a, b) => 
    new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
  ) || []

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0f2118] to-forest">
      
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(250,188,85,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(250,188,85,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='20' y='50' font-family='serif' font-size='40' fill='%23fabc55' transform='rotate(-15 20 50)'%3EE=mc%C2%B2%3C/text%3E%3Ctext x='150' y='120' font-family='serif' font-size='60' fill='%23fabc55' transform='rotate(10 150 120)'%3E%E2%88%91%3C/text%3E%3Ctext x='200' y='40' font-family='serif' font-size='35' fill='%23fabc55' transform='rotate(25 200 40)'%3E%CF%80r%C2%B2%3C/text%3E%3Ctext x='40' y='220' font-family='serif' font-size='50' fill='%23fabc55' transform='rotate(-5 40 220)'%3E%E2%88%AB%3C/text%3E%3Ctext x='180' y='260' font-family='serif' font-size='25' fill='%23fabc55' transform='rotate(15 180 260)'%3E%E2%88%9A-1%3C/text%3E%3C/svg%3E")`,
          backgroundSize: '350px 350px'
        }}
      />

      <div className="relative pt-32 pb-24 px-6 max-w-6xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-display text-gold mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] tracking-widest">
            АФИША
          </h1>
          <p className="text-offwhite-dim text-lg md:text-xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] tracking-wide">
            Особые вечера для ценителей вкуса и хорошей мысли.
          </p>
        </motion.div>

        {loading && <Loader2 className="mx-auto text-gold animate-spin my-12" size={40} />}

        {failed && (
          <p className="text-center text-offwhite-dim text-lg drop-shadow-md py-12">
            Не удалось загрузить события. Попробуйте обновить страницу.
          </p>
        )}

        {!loading && !failed && events && events.length === 0 && (
          <div className="text-center py-20 bg-forest-dark/60 border border-gold/10 rounded-2xl max-w-2xl mx-auto backdrop-blur-sm">
            <CalendarX size={48} className="mx-auto text-gold/50 mb-4 drop-shadow-md" />
            <p className="text-offwhite-dim text-lg">Пока нет ни одного события.</p>
          </div>
        )}

        {!loading && !failed && futureEvents.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-3xl font-display text-offwhite uppercase tracking-wider">Ближайшие события</h2>
              <div className="flex-1 h-[1px] bg-gold/20" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {futureEvents.map((event, i) => (
                <EventCard key={event.id} event={event} isPast={false} index={i} />
              ))}
            </div>
          </div>
        )}

        {!loading && !failed && pastEvents.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-8 opacity-70">
              <Clock className="text-offwhite-dim" size={24} />
              <h2 className="text-2xl font-display text-offwhite-dim uppercase tracking-wider">Архив событий</h2>
              <div className="flex-1 h-[1px] bg-offwhite-dim/20" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event, i) => (
                <EventCard key={event.id} event={event} isPast={true} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}