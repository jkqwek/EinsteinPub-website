import { useEffect, useState } from "react"
import { getOpenStatus, type OpenStatus as Status } from "../siteInfo"

/**
 * Бейдж «Открыто до 01:00» / «Закрыто · откроется сегодня в 15:00».
 * Обновляется раз в минуту.
 */
export function OpenStatus({ className = "" }: { className?: string }) {
  const [status, setStatus] = useState<Status>(() => getOpenStatus())

  useEffect(() => {
    const timer = setInterval(() => setStatus(getOpenStatus()), 60_000)
    return () => clearInterval(timer)
  }, [])

  if (status.open) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <span className="relative flex w-2.5 h-2.5 shrink-0">
          <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
          <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </span>
        <span className="text-emerald-300 text-sm">
          Открыто до {status.closesAt}
        </span>
      </span>
    )
  }

  const whenLabel =
    status.daysUntil === 0
      ? "сегодня"
      : status.daysUntil === 1
        ? "завтра"
        : null

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
      <span className="text-offwhite-dim text-sm">
        Закрыто
        {whenLabel
          ? ` · откроется ${whenLabel} в ${status.opensAt}`
          : ` · откроется в ${status.opensAt}`}
      </span>
    </span>
  )
}