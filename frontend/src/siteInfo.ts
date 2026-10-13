import { TelegramIcon, VkIcon } from "./components/SocialIcons"

// Contact details shared by the footer and the Contacts page
export const address = {
  street: "ул. Зорге, 17",
  city: "Ростов-на-Дону",
}

export const phone = {
  label: "+7 (989) 535-49-55",
  href: "tel:+79895354955",
}

export const schedule: { day: number; open: string; close: string }[] = [
  { day: 0, open: "15:00", close: "01:00" }, // Вс
  { day: 1, open: "15:00", close: "01:00" }, // Пн
  { day: 2, open: "15:00", close: "01:00" }, // Вт
  { day: 3, open: "15:00", close: "01:00" }, // Ср
  { day: 4, open: "15:00", close: "01:00" }, // Чт
  { day: 5, open: "15:00", close: "02:00" }, // Пт
  { day: 6, open: "15:00", close: "02:00" }, // Сб
]

export const openingHours = [
  { days: "Пн–Чт, Вс", time: "15:00–01:00" },
  { days: "Пт–Сб", time: "15:00–02:00" },
]

// Opens the address in Yandex Maps
export const mapLink =
  "https://yandex.ru/maps/?text=" +
  encodeURIComponent(`${address.city}, ${address.street}`)

// Google Maps embed for "Ростов-на-Дону, ул. Зорге, 17"
export const mapEmbedUrl =
  "https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1z0KDQvtGB0YLQvtCyLdC90LAt0JTQvtC90YMsINGD0LsuINCX0L7RgNCz0LUsIDE3!6i16!3m1!1sru!5m1!1sru"

export const socialLinks = [
  { name: "ВКонтакте", href: "https://vk.ru/pub_einstein?ysclid=mv7243i4ik656379084", icon: VkIcon },
  { name: "Телеграм", href: "https://t.me/Einstein_pub", icon: TelegramIcon },
]

export type OpenStatus =
  | { open: true; closesAt: string }
  | { open: false; opensAt: string; daysUntil: number }

function getMoscowNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Moscow",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date())

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? ""

  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  }
  const day = dayMap[get("weekday")] ?? 0
  const minutes = parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10)
  return { day, minutes }
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

export function getOpenStatus(): OpenStatus {
  const { day, minutes } = getMoscowNow()

  const today = schedule.find((s) => s.day === day)
  const yesterday = schedule.find((s) => s.day === (day + 6) % 7)

  if (today) {
    const openMin = toMinutes(today.open)
    const closeMin = toMinutes(today.close)
    const closeOnNextDay = closeMin <= openMin
    if (minutes >= openMin && (closeOnNextDay || minutes < closeMin)) {
      return { open: true, closesAt: today.close }
    }
  }

  if (yesterday) {
    const yOpen = toMinutes(yesterday.open)
    const yClose = toMinutes(yesterday.close)
    if (yClose <= yOpen && minutes < yClose) {
      return { open: true, closesAt: yesterday.close }
    }
  }

  if (today) {
    const openMin = toMinutes(today.open)
    if (minutes < openMin) {
      return { open: false, opensAt: today.open, daysUntil: 0 }
    }
  }

  for (let i = 1; i <= 7; i++) {
    const next = schedule.find((s) => s.day === (day + i) % 7)
    if (next) return { open: false, opensAt: next.open, daysUntil: i }
  }

  return { open: false, opensAt: "15:00", daysUntil: 0 }
}

export const heroStats: {
  value: number
  label: string
  decimals?: number
  prefix?: string
  suffix?: string
}[] = [
  { value: 2013, label: "год основания", prefix: "с " },
  { value: 5, label: "рейтинг на Яндекс.Картах", decimals: 1, suffix: "★" },
]