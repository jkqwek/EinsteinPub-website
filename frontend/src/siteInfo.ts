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

export const openingHours = [
  { days: "Пн–Чт, Вс", time: "15:00–01:00" },
  { days: "Пт–Сб", time: "15:00–02:00" },
]

// Opens the address in Yandex Maps
export const mapLink =
  "https://yandex.ru/maps/?text=" +
  encodeURIComponent(`${address.city}, ${address.street}`)

// Google Maps embed for "Ростов-на-Дону, ул. Зорге, 17" (the 1z… part is the
// base64 query). The short maps?q=…&output=embed form redirects with
// X-Frame-Options: SAMEORIGIN, so the final embed URL is used directly.
export const mapEmbedUrl =
  "https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1z0KDQvtGB0YLQvtCyLdC90LAt0JTQvtC90YMsINGD0LsuINCX0L7RgNCz0LUsIDE3!6i16!3m1!1sru!5m1!1sru"

// TODO: replace "#" with the real community and channel URLs
export const socialLinks = [
  { name: "ВКонтакте", href: "#", icon: VkIcon },
  { name: "Телеграм", href: "#", icon: TelegramIcon },
]
