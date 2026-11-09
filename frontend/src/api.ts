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

export type Vacancy = {
  id: number
  title: string
  description: string
  schedule: string // "" when not set
  salary: string // free text, "" when not set
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
  return `${price.toLocaleString("ru-RU")} ₽`
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

// Loads a GET endpoint. `loading` is true while the request is in flight,
// `failed` becomes true on error. On path change, previous state resets.
export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setFailed(false)
    setData(null)

    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(
        (json) => {
          if (cancelled) return
          setData(json)
          setLoading(false)
        },
        () => {
          if (cancelled) return
          setFailed(true)
          setLoading(false)
        },
      )

    return () => {
      cancelled = true
    }
  }, [path])

  return { data, loading, failed }
}

// Sends a booking request; on failure throws an Error whose message can be shown to the guest
export function createBooking(booking: BookingRequest) {
  return postForm(
    "/api/bookings/",
    { headers: { "Content-Type": "application/json" }, body: JSON.stringify(booking) },
    "Слишком много заявок. Попробуйте позже или позвоните нам.",
  )
}

// Sends a job application as multipart: vacancy (id, omitted for "any"), name, phone, email,
// about, resume (file), adult, consent. Errors are thrown like in createBooking
export function createApplication(form: FormData) {
  return postForm(
    "/api/applications/",
    { body: form },
    "Слишком много откликов. Попробуйте позже или позвоните нам.",
  )
}

async function postForm(path: string, init: RequestInit, tooManyMessage: string) {
  const res = await fetch(path, { method: "POST", ...init }).catch(() => {
    throw new Error("Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.")
  })
  if (res.ok) return
  if (res.status === 429) throw new Error(tooManyMessage)
  // Validation errors look like { "phone": ["Проверьте номер телефона."] }
  const errors = await res.json().catch(() => ({}))
  const [message] = Object.values(errors).flat()
  throw new Error(
    typeof message === "string"
      ? message
      : "Не удалось отправить заявку. Попробуйте ещё раз.",
  )
}