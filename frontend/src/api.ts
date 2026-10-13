import { useEffect, useState } from "react"

// Types and calls for the Django API (backend/). Photos come as "/media/..." paths, "" when absent.

export type Dish = {
  id: number
  name: string
  description: string
  price: number // rubles
  weight: string // serving size as shown: "500 мл", "350 г"; "" when not set
  image: string
}

export type MenuCategory = {
  slug: string
  name: string
  dishes: Dish[]
}

export type PubEvent = {
  id: number
  title: string
  starts_at: string // ISO date-time with offset
  description: string
  image: string
}

export type Photo = {
  id: number
  image: string
  caption: string
}

export type BookingRequest = {
  name: string
  phone: string
  guests: number
  date: string // YYYY-MM-DD
  time: string // HH:MM
  wishes: string
  consent: boolean
}

// 1290 -> "1 290 ₽"
export function formatPrice(price: number) {
  return `${price.toLocaleString("ru-RU")} ₽`
}

// "2026-10-15T19:00:00+03:00" -> "15 октября в 19:00", in the pub's time zone
export function formatEventDate(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  })
}

// Loads a GET endpoint: data is null while loading, failed is true if it failed
export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(setData, () => setFailed(true))
  }, [path])

  return { data, failed }
}

// Sends a booking request; on failure throws an Error whose message can be shown to the guest
export async function createBooking(booking: BookingRequest) {
  const res = await fetch("/api/bookings/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
  }).catch(() => {
    throw new Error("Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.")
  })
  if (res.ok) return
  if (res.status === 429)
    throw new Error("Слишком много заявок. Попробуйте позже или позвоните нам.")
  // Validation errors look like { "phone": ["Проверьте номер телефона."] }
  const errors = await res.json().catch(() => ({}))
  const [message] = Object.values(errors).flat()
  throw new Error(
    typeof message === "string"
      ? message
      : "Не удалось отправить заявку. Попробуйте ещё раз.",
  )
}
