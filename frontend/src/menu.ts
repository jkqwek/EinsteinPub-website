// Menu categories: id -> label. The backend accepts the same ids (backend/server.js)
export const categories = {
  Beers: "Пиво",
  Cocktails: "Коктейли",
  Wines: "Вина",
  Mains: "Горячее",
}

export type Category = keyof typeof categories

export type MenuItem = {
  id: string
  name: string
  cat: Category
  price: number // rubles
  desc: string
  weight: string // serving size as shown: "500 мл", "350 г"; "" when not set
  image: string // "" when the item has no photo
}

// 1290 -> "1 290 ₽"
export function formatPrice(price: number) {
  return `${price.toLocaleString("ru-RU")} ₽`
}

export async function fetchMenu(): Promise<MenuItem[]> {
  const res = await fetch("/api/menu")
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
