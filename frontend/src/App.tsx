import { useState, useEffect } from "react"
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Menu as MenuIcon, X, MapPin, Phone, ArrowRight } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { Booking } from "./pages/Booking"
import { Gallery } from "./pages/Gallery"
import { Contacts } from "./pages/Contacts"
import { Admin } from "./pages/Admin"
import {
  address,
  mapLink,
  openingHours,
  phone,
  socialLinks,
} from "./siteInfo"
import { enabledSections } from "./sections"

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
            className="font-display text-2xl tracking-wider text-gold font-bold"
          >
            EINSTEIN
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
            className="fixed inset-0 z-[60] bg-forest flex flex-col items-center justify-center"
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
function Home() {
  return (
    <div className="min-h-screen">
      <section className="h-screen relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=2000"
            alt="Интерьер паба"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest/50 to-forest"></div>
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-black mb-6 leading-tight"
          >
            ГДЕ ПЬЮТ
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-light shimmer">
              ВЕЛИКИЕ УМЫ
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-offwhite-dim max-w-2xl mx-auto mb-10"
          >
            Крафтовое пиво, изысканные вина и интеллектуальные беседы в
            премиальной атмосфере.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/menu"
              className="px-8 py-3 border border-gold text-gold font-bold uppercase text-sm rounded-sm hover:bg-gold/10 transition-colors w-full sm:w-auto"
            >
              Смотреть меню
            </Link>
            <Link
              to="/booking"
              className="px-8 py-3 bg-gold text-forest-dark font-bold uppercase text-sm rounded-sm hover:bg-gold-light transition-colors shadow-[0_0_15px_rgba(250,188,85,0.2)] hover:shadow-[0_0_25px_rgba(250,188,85,0.4)] w-full sm:w-auto"
            >
              Забронировать стол
            </Link>
          </motion.div>
        </div>
      </section>

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
          {[
            {
              title: "Вечер джаза и стаута",
              date: "15 октября",
              image:
                "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=600",
            },
            {
              title: "Дегустация крафтового пива",
              date: "22 октября",
              image:
                "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=600",
            },
            {
              title: "Философский паб-квиз",
              date: "29 октября",
              image:
                "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&q=80&w=600",
            },
          ].map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group glassmorphism rounded-lg overflow-hidden cursor-pointer"
            >
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-forest/20 group-hover:bg-transparent transition-colors z-10" />
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="p-6">
                <div className="text-gold text-sm font-bold mb-2">
                  {event.date}
                </div>
                <h3 className="text-xl font-display mb-2 break-words hyphens-auto group-hover:text-gold transition-colors">
                  {event.title}
                </h3>
                <p className="text-offwhite-dim text-sm line-clamp-2">
                  Вечер изысканных вкусов и отличной компании в самом сердце
                  города.
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Menu() {
  const [activeTab, setActiveTab] = useState("Beers")
  const tabs = [
    { id: "All", label: "Все" },
    { id: "Beers", label: "Пиво" },
    { id: "Cocktails", label: "Коктейли" },
    { id: "Wines", label: "Вина" },
    { id: "Mains", label: "Горячее" },
  ]

  const items = [
    {
      name: "Квантовый IPA",
      cat: "Beers",
      price: "450\u00A0₽",
      desc: "Хмелевой, с цитрусовыми нотами, 6,5% алк.",
      image:
        "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Стаут «Относительность»",
      cat: "Beers",
      price: "490\u00A0₽",
      desc: "Тёмный шоколад, жжёный солод, 8% алк.",
      image:
        "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Алхимик",
      cat: "Cocktails",
      price: "750\u00A0₽",
      desc: "Джин, бузина, дымящийся розмарин",
      image:
        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Кот Шрёдингера",
      cat: "Cocktails",
      price: "790\u00A0₽",
      desc: "Бурбон, биттеры, загадочное послевкусие",
      image:
        "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Свинина «Яблоко Ньютона»",
      cat: "Mains",
      price: "1\u00A0290\u00A0₽",
      desc: "Томлёная свиная грудинка, яблочное пюре",
      image:
        "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=300&q=80",
    },
  ]

  const filtered =
    activeTab === "All" ? items : items.filter((i) => i.cat === activeTab)

  return (
    <div className="pt-32 pb-24 px-6 max-w-5xl mx-auto min-h-screen">
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

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={item.name}
              className="glassmorphism rounded-xl p-4 flex gap-4 group cursor-pointer border border-transparent hover:border-gold/50 transition-colors"
            >
              <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start lg:gap-3 mb-1">
                  <h3 className="min-w-0 break-words hyphens-auto font-display font-bold text-lg group-hover:text-gold transition-colors">
                    {item.name}
                  </h3>
                  <span className="shrink-0 whitespace-nowrap text-gold font-display font-bold">
                    {item.price}
                  </span>
                </div>
                <p className="text-offwhite-dim text-sm">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// Simple placeholders for other pages
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

export default function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate preloader
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
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/menu"
          element={
            enabledSections.menu ? <Menu /> : <Placeholder title="НАШЕ МЕНЮ" />
          }
        />
        <Route path="/events" element={<Placeholder title="СОБЫТИЯ" />} />
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
        <Route
          path="/admin"
          element={
            enabledSections.admin ? (
              <Admin />
            ) : (
              <Placeholder title="АДМИН-ПАНЕЛЬ" />
            )
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Footer */}
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
            <div className="space-y-2">
              {openingHours.map(({ days, time }) => (
                <p key={days} className="text-offwhite-dim text-sm">
                  {days}: {time}
                </p>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Мы в соцсетях</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-gold">
              {socialLinks.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  className="flex items-center gap-2 hover:text-offwhite transition-colors"
                >
                  <Icon size={16} />
                  {name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </BrowserRouter>
  )
}
