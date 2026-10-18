import { useState, useEffect, useRef } from "react"
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Menu as MenuIcon,
  X,
  MapPin,
  Phone,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { Booking } from "./pages/Booking"
import { Gallery } from "./pages/Gallery"
import { Contacts } from "./pages/Contacts"
import { EventCard, Events } from "./pages/Events"
import { Privacy } from "./pages/Privacy"
import { AdminLogin } from "./admin/Login"
import { AdminLayout } from "./admin/AdminLayout"
import { AdminEvents } from "./admin/Events"
import { AdminMenu } from "./admin/Menu"
import { AdminGallery } from "./admin/Gallery"
import { AdminBookings } from "./admin/Bookings"
import { OpenStatus } from "./components/OpenStatus"

import {
  address,
  heroStats,
  mapLink,
  openingHours,
  phone,
  socialLinks,
} from "./siteInfo"
import { enabledSections } from "./sections"
import {
  formatPrice,
  useApi,
  type MenuCategory,
  type PubEvent,
} from "./api"

import menuHero from "./assets/menu-hero.webp"
import heroBg from "./assets/hero-bg.png" 
import logo from "./assets/logo.png"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- Layout & Navigation ---
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const links = [
    { name: "Главная", path: "/" },
    { name: "Меню", path: "/menu" },
    { name: "События", path: "/events" },
    { name: "Галерея", path: "/gallery" },
    { name: "Бронирование", path: "/booking" },
    { name: "Контакты", path: "/contacts" },
  ]

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glassmorphism border-0 border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-4 group"
          >
            {/* 👇 Добавлена обводка (4 тени без размытия) */}
            <img
              src={logo}
              alt="Einstein Logo"
              className="h-11 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-[1px_0_0_#fabc55] drop-shadow-[-1px_0_0_#fabc55] drop-shadow-[0_1px_0_#fabc55] drop-shadow-[0_-1px_0_#fabc55]"
            />
            <span className="font-display text-2xl tracking-wider text-gold font-bold">
              EINSTEIN
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium tracking-wide uppercase transition-colors relative group",
                  location.pathname === link.path
                    ? "text-gold"
                    : "text-offwhite-dim hover:text-offwhite",
                )}
              >
                {link.name}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 w-full h-[1px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300",
                    location.pathname === link.path && "scale-x-100",
                  )}
                />
              </Link>
            ))}
            <Link
              to="/booking"
              className="px-6 py-2 bg-gold text-forest-dark font-bold uppercase text-sm rounded-sm hover:bg-gold-light transition-colors hover:shadow-[0_0_15px_rgba(250,188,85,0.4)]"
            >
              Забронировать
            </Link>
          </div>

          <button
            className="lg:hidden text-gold p-2"
            onClick={() => setIsOpen(true)}
          >
            <MenuIcon size={24} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ type: "tween", duration: 0.4 }}
            className="fixed inset-0 z-[60] bg-forest bg-gradient-to-t from-burgundy/50 to-transparent flex flex-col items-center justify-center"
          >
            <button
              className="absolute top-6 right-6 text-gold p-2"
              onClick={() => setIsOpen(false)}
            >
              <X size={32} />
            </button>
            <div className="flex flex-col items-center gap-8">
              {links.map((link, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  key={link.path}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="font-display text-4xl text-offwhite hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// --- Pages ---
function HeroStat({
  value,
  label,
  decimals = 0,
  prefix = "",
  suffix = "",
}: {
  value: number
  label: string
  decimals?: number
  prefix?: string
  suffix?: string
}) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const duration = 1600
    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(value * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
      else setDisplay(value)
    }

    const el = ref.current
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          raf = requestAnimationFrame(tick)
          observer.disconnect()
        }
      },
      { threshold: 0.5 },
    )
    if (el) observer.observe(el)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [value])

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : Math.round(display).toString()

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl font-display text-gold tabular-nums drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        {prefix}
        {formatted}
        {suffix}
      </div>
      <div className="text-xs md:text-sm text-offwhite uppercase tracking-wider mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
        {label}
      </div>
    </div>
  )
}

function Home() {
  const { data: events } = useApi<PubEvent[]>("/api/events/?limit=3")

  const subtitles = [
    "Крафтовое пиво",
    "Изысканные вина",
    "Интеллектуальные беседы",
    "Особые вечера",
  ]
  const [subIndex, setSubIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(
      () => setSubIndex((i) => (i + 1) % subtitles.length),
      4000,
    )
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen">
      <section className="h-screen relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt="Интерьер паба"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-forest"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-black mb-6 leading-tight text-offwhite drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
          >
            ГДЕ ПЬЮТ
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-light shimmer drop-shadow-none">
              ВЕЛИКИЕ УМЫ
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="h-11 md:h-14 relative mb-10"
            aria-live="polite"
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={subIndex}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="absolute inset-0 font-display text-2xl md:text-3xl tracking-wide text-gold-light text-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
              >
                {subtitles[subIndex]}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/menu"
              className="px-8 py-3 border border-gold text-gold font-bold uppercase text-sm rounded-sm hover:bg-gold/20 transition-colors w-full sm:w-auto backdrop-blur-md bg-black/20"
            >
              Смотреть меню
            </Link>
            <Link
              to="/booking"
              className="px-8 py-3 bg-gold text-forest-dark font-bold uppercase text-sm rounded-sm hover:bg-gold-light transition-colors shadow-[0_0_20px_rgba(250,188,85,0.4)] w-full sm:w-auto"
            >
              Забронировать стол
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="absolute bottom-6 md:bottom-10 left-0 right-0 z-10"
        >
          <div className="max-w-3xl mx-auto px-6 flex justify-center gap-16 md:gap-32">
            {heroStats.map((s) => (
              <HeroStat
                key={s.label}
                value={s.value}
                label={s.label}
                decimals={s.decimals}
                prefix={s.prefix}
                suffix={s.suffix}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {enabledSections.events && events && events.length > 0 && (
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"
          >
            <div>
              <h2 className="text-3xl md:text-5xl font-display mb-4 text-gold">
                БЛИЖАЙШИЕ СОБЫТИЯ
              </h2>
              <p className="text-offwhite-dim">
                Особые вечера для ценителей вкуса и хорошей мысли.
              </p>
            </div>
            <Link
              to="/events"
              className="text-gold flex items-center gap-2 hover:gap-4 transition-all uppercase text-sm font-bold"
            >
              Все события <ArrowRight size={16} />
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {events.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Menu() {
  const [activeTab, setActiveTab] = useState("All")
  const { data: menu, loading, failed } = useApi<MenuCategory[]>("/api/menu/")
  const categories = (menu ?? []).filter((c) => c.dishes.length > 0)

  const tabs = [
    { id: "All", label: "Все" },
    ...categories.map((c) => ({ id: c.slug, label: c.name })),
  ]

  const filtered = categories
    .filter((c) => activeTab === "All" || c.slug === activeTab)
    .flatMap((c) => c.dishes.map((dish) => ({ ...dish, category: c.name })))

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-x-0 top-0 h-screen overflow-hidden">
        <img
          src={menuHero}
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-burgundy/40 via-forest/50 to-forest" />
      </div>
      <div className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-display text-gold mb-4">
            НАШЕ МЕНЮ
          </h1>
          <p className="text-offwhite-dim">
            Тщательно подобранные позиции для взыскательного вкуса.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold uppercase transition-all duration-300",
                activeTab === tab.id
                  ? "bg-gold text-forest-dark shadow-[0_0_15px_rgba(250,188,85,0.3)]"
                  : "glassmorphism text-offwhite hover:text-gold",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <Loader2 className="mx-auto text-gold animate-spin" size={32} />
        )}
        {!loading && (failed || (menu && filtered.length === 0)) && (
          <p className="text-center text-offwhite-dim">
            {failed
              ? "Не удалось загрузить меню. Попробуйте обновить страницу."
              : "В этом разделе пока пусто."}
          </p>
        )}

        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={item.id}
                className="glassmorphism rounded-xl overflow-hidden flex flex-col group cursor-pointer border border-transparent hover:border-gold/50 hover:shadow-[0_12px_40px_-8px_rgba(97,24,32,0.7)] transition-[border-color,box-shadow] duration-300"
              >
                {item.image && (
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-burgundy text-gold-light text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-sm">
                      {item.category}
                    </span>
                  </div>
                )}
                <div className="flex-1 p-6 flex flex-col border-t-4 border-gold">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h3 className="min-w-0 break-words hyphens-auto font-display font-bold text-xl group-hover:text-gold transition-colors">
                      {item.name}
                    </h3>
                    <span className="shrink-0 whitespace-nowrap text-gold font-display font-bold text-lg">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-1 bg-gold rounded-full" />
                    {item.weight && (
                      <span className="text-sm font-semibold tracking-wide text-offwhite-dim">
                        {item.weight}
                      </span>
                    )}
                  </div>
                  <p className="text-offwhite-dim">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="pt-32 pb-24 px-6 min-h-screen flex flex-col items-center justify-center text-center">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-display text-gold mb-6"
      >
        {title}
      </motion.h1>
      <p className="text-offwhite-dim">Раздел скоро появится.</p>
    </div>
  )
}

function NotFound() {
  return (
    <div className="pt-32 pb-24 px-6 min-h-screen flex flex-col items-center justify-center text-center">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-7xl md:text-9xl font-display text-gold mb-6"
      >
        404
      </motion.h1>
      <p className="text-offwhite-dim mb-10">
        Эта страница затерялась где-то в пространстве-времени.
      </p>
      <Link
        to="/"
        className="px-8 py-3 bg-gold text-forest-dark font-bold uppercase text-sm rounded-sm hover:bg-gold-light transition-colors"
      >
        На главную
      </Link>
    </div>
  )
}

function AppShell() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith("/admin")

  return (
    <>
      {!isAdmin && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/menu"
          element={
            enabledSections.menu ? <Menu /> : <Placeholder title="НАШЕ МЕНЮ" />
          }
        />
        <Route
          path="/events"
          element={
            enabledSections.events ? <Events /> : <Placeholder title="СОБЫТИЯ" />
          }
        />
        <Route
          path="/gallery"
          element={
            enabledSections.gallery ? (
              <Gallery />
            ) : (
              <Placeholder title="ГАЛЕРЕЯ" />
            )
          }
        />
        <Route
          path="/booking"
          element={
            enabledSections.booking ? (
              <Booking />
            ) : (
              <Placeholder title="БРОНЬ СТОЛА" />
            )
          }
        />
        <Route
          path="/contacts"
          element={
            enabledSections.contacts ? (
              <Contacts />
            ) : (
              <Placeholder title="КОНТАКТЫ" />
            )
          }
        />
        <Route path="/privacy" element={<Privacy />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminEvents />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="bookings" element={<AdminBookings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isAdmin && (
        <footer className="bg-forest-dark py-12 border-t border-gold/10">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="font-display text-2xl text-gold font-bold mb-4">
                EINSTEIN
              </div>
              <p className="text-offwhite-dim text-sm">
                Место, где пьют великие умы. Премиальный паб, в котором
                крафтовая культура встречается с элегантностью.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Адрес</h4>
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-offwhite-dim text-sm flex items-start gap-2 mb-2 hover:text-gold transition-colors"
              >
                <MapPin size={16} className="shrink-0 mt-0.5" />
                <span>
                  {address.street},{" "}
                  <span className="whitespace-nowrap">{address.city}</span>
                </span>
              </a>
              <a
                href={phone.href}
                className="text-offwhite-dim text-sm flex items-center gap-2 hover:text-gold transition-colors"
              >
                <Phone size={16} className="shrink-0" />
                {phone.label}
              </a>
            </div>
            <div>
              <h4 className="font-bold mb-4">Часы работы</h4>
              <div className="space-y-2 mb-3">
                {openingHours.map(({ days, time }) => (
                  <p key={days} className="text-offwhite-dim text-sm">
                    {days}: {time}
                  </p>
                ))}
              </div>
              <OpenStatus />
            </div>
            <div>
              <h4 className="font-bold mb-4">Мы в соцсетях</h4>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-gold">
                {socialLinks.map(({ name, href, icon: Icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-offwhite transition-colors"
                  >
                    <Icon size={16} />
                    {name}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 mt-8">
            <Link
              to="/privacy"
              className="text-offwhite-dim text-xs hover:text-gold transition-colors"
            >
              Политика конфиденциальности
            </Link>
          </div>
        </footer>
      )}
    </>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-forest flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-gold font-display text-6xl font-black tracking-widest relative"
        >
          EINSTEIN
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="absolute -bottom-2 left-0 h-1 bg-gold"
          />
        </motion.div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppShell />
    </BrowserRouter>
  )
}