import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  Calendar,
  LogOut,
  Search,
  Edit2,
  Trash2,
  Plus,
  Upload,
  CheckCircle2,
  TrendingUp,
} from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const categoryLabels: Record<string, string> = {
  Beers: "Пиво",
  Cocktails: "Коктейли",
  Wines: "Вина",
  Mains: "Горячее",
}

const statusLabels: Record<string, string> = {
  Confirmed: "Подтверждена",
  Pending: "Ожидает",
  Completed: "Завершена",
}

// Chart Placeholder component (SVG)
function BarChart() {
  return (
    <svg
      className="w-full h-48"
      viewBox="0 0 500 150"
      preserveAspectRatio="none"
    >
      <line
        x1="0"
        y1="130"
        x2="500"
        y2="130"
        stroke="rgba(250,188,85,0.2)"
        strokeWidth="2"
      />
      {[40, 70, 45, 90, 60, 110, 85].map((h, i) => (
        <motion.rect
          key={i}
          initial={{ height: 0, y: 130 }}
          animate={{ height: h, y: 130 - h }}
          transition={{ duration: 0.8, delay: i * 0.1 }}
          x={40 + i * 65}
          width="40"
          rx="4"
          fill="#fabc55"
          className="hover:opacity-80 transition-opacity cursor-pointer"
        />
      ))}
    </svg>
  )
}

export function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [toast, setToast] = useState<{
    msg: string
    type: "success" | "error"
  } | null>(null)

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="pt-20 min-h-screen flex bg-forest-dark">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 glassmorphism border-0 border-r border-gold/10 hidden md:flex flex-col sticky top-20 self-start h-[calc(100vh-80px)] z-40">
        <div className="p-6">
          <h2 className="font-display text-xl text-gold mb-8">Админ-панель</h2>
          <nav className="flex flex-col gap-2">
            {[
              { id: "dashboard", icon: LayoutDashboard, label: "Обзор" },
              { id: "menu", icon: Plus, label: "Меню" },
              { id: "events", icon: Calendar, label: "События" },
              { id: "bookings", icon: Users, label: "Бронирования" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium w-full text-left",
                  activeTab === item.id
                    ? "bg-gold/10 text-gold"
                    : "text-offwhite hover:bg-forest-light",
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6">
          <button className="flex items-center gap-3 text-offwhite hover:text-gold transition-colors text-sm font-medium">
            <LogOut size={18} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-8 relative">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && <DashboardTab key="dashboard" />}
          {activeTab === "menu" && (
            <ManageMenuTab key="menu" showToast={showToast} />
          )}
          {activeTab === "events" && (
            <ManageEventsTab key="events" showToast={showToast} />
          )}
          {activeTab === "bookings" && (
            <ViewBookingsTab key="bookings" showToast={showToast} />
          )}
        </AnimatePresence>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-50 font-bold",
                toast.type === "success"
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white",
              )}
            >
              <CheckCircle2 size={20} />
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function DashboardTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h1 className="text-3xl font-display text-offwhite mb-8">
        Обзор
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {[
          {
            label: "Бронирований за неделю",
            value: "142",
            icon: Users,
            trend: "+12%",
          },
          {
            label: "Ближайшие события",
            value: "4",
            icon: Calendar,
            trend: "На 30 дней вперёд",
          },
          {
            label: "Выручка (демо)",
            value: "845\u00A0000\u00A0₽",
            icon: TrendingUp,
            trend: "+5,4%",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="glassmorphism p-6 rounded-xl border border-gold/10 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="text-offwhite-dim text-sm uppercase font-bold">
                {stat.label}
              </div>
              <stat.icon size={20} className="text-gold" />
            </div>
            <div className="text-4xl font-display text-gold mb-2">
              {stat.value}
            </div>
            <div className="text-sm text-green-400">{stat.trend}</div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon size={100} />
            </div>
          </div>
        ))}
      </div>

      <div className="glassmorphism p-6 rounded-xl border border-gold/10">
        <h3 className="text-xl font-display text-offwhite mb-6">
          Бронирования по дням
        </h3>
        <BarChart />
      </div>
    </motion.div>
  )
}

function ManageMenuTab({ showToast }: { showToast: (m: string) => void }) {
  const [items, setItems] = useState([
    { id: 1, name: "Квантовый IPA", cat: "Beers", price: "450\u00A0₽" },
    {
      id: 2,
      name: "Стаут «Относительность»",
      cat: "Beers",
      price: "490\u00A0₽",
    },
  ])
  const [loading, setLoading] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      showToast("Позиция меню сохранена!")
    }, 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h1 className="text-3xl font-display text-offwhite mb-8">
        Управление меню
      </h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1 glassmorphism p-6 rounded-xl border border-gold/10 h-max">
          <h2 className="text-xl font-display text-gold mb-6">
            Добавить / изменить
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-offwhite-dim text-xs uppercase font-bold mb-1 block">
                Название
              </label>
              <input
                type="text"
                className="w-full bg-forest-dark border border-gold/20 rounded-lg px-3 py-2 text-offwhite outline-none focus:border-gold transition-all"
                required
              />
            </div>
            <div>
              <label className="text-offwhite-dim text-xs uppercase font-bold mb-1 block">
                Категория
              </label>
              <select className="w-full bg-forest-dark border border-gold/20 rounded-lg px-3 py-2 text-offwhite outline-none focus:border-gold transition-all">
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-offwhite-dim text-xs uppercase font-bold mb-1 block">
                Цена
              </label>
              <input
                type="text"
                className="w-full bg-forest-dark border border-gold/20 rounded-lg px-3 py-2 text-offwhite outline-none focus:border-gold transition-all"
                required
              />
            </div>
            <div>
              <label className="text-offwhite-dim text-xs uppercase font-bold mb-1 block">
                Описание
              </label>
              <textarea className="w-full bg-forest-dark border border-gold/20 rounded-lg px-3 py-2 text-offwhite outline-none focus:border-gold transition-all h-20 resize-none"></textarea>
            </div>
            <div>
              <label className="text-offwhite-dim text-xs uppercase font-bold mb-1 block">
                Фото
              </label>
              <div className="border-2 border-dashed border-gold/20 rounded-lg p-4 text-center cursor-pointer hover:bg-gold/5 transition-colors">
                <Upload className="mx-auto text-gold mb-2" size={24} />
                <span className="text-offwhite-dim text-sm">Загрузить фото</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-forest-dark font-bold uppercase py-3 rounded-lg hover:bg-gold-light transition-all flex justify-center"
            >
              {loading ? (
                <span className="animate-spin border-2 border-forest-dark border-t-transparent rounded-full w-5 h-5"></span>
              ) : (
                "Сохранить"
              )}
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 glassmorphism rounded-xl border border-gold/10 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-forest-light/50 text-offwhite-dim text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Название</th>
                <th className="px-6 py-4 font-medium">Категория</th>
                <th className="px-6 py-4 font-medium">Цена</th>
                <th className="px-6 py-4 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-forest-light/30 transition-colors group"
                >
                  <td className="px-6 py-4 font-medium text-offwhite">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-offwhite-dim text-sm">
                    {categoryLabels[item.cat]}
                  </td>
                  <td className="px-6 py-4 text-gold font-bold">
                    {item.price}
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-3">
                    <button className="text-offwhite-dim hover:text-gold transition-colors p-1">
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setItems(items.filter((i) => i.id !== item.id))
                        showToast("Позиция удалена")
                      }}
                      className="text-offwhite-dim hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

function ManageEventsTab({ showToast }: { showToast: (m: string) => void }) {
  // Similar to Manage Menu, skipping full re-implementation of identical logic for brevity
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h1 className="text-3xl font-display text-offwhite mb-8">
        Управление событиями
      </h1>
      <div className="glassmorphism p-12 text-center rounded-xl border border-gold/10 text-offwhite-dim">
        <Calendar size={48} className="mx-auto text-gold mb-4 opacity-50" />
        <p>Раздел устроен так же, как управление меню.</p>
        <p className="text-sm mt-2">
          Здесь можно будет добавлять, изменять и удалять события.
        </p>
      </div>
    </motion.div>
  )
}

function ViewBookingsTab({ showToast }: { showToast: (m: string) => void }) {
  const [search, setSearch] = useState("")
  const [bookings, setBookings] = useState([
    {
      id: 1,
      name: "Альбер Камю",
      datetime: "15 окт., 19:00",
      guests: 2,
      status: "Confirmed",
    },
    {
      id: 2,
      name: "Мария Кюри",
      datetime: "16 окт., 20:00",
      guests: 4,
      status: "Pending",
    },
    {
      id: 3,
      name: "Нильс Бор",
      datetime: "16 окт., 21:30",
      guests: 3,
      status: "Completed",
    },
  ])

  const filtered = bookings.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-display text-offwhite">Бронирования</h1>
        <div className="glassmorphism px-4 py-2 rounded-full flex items-center gap-2 text-sm text-offwhite-dim border border-gold/20">
          <Search size={16} />
          <input
            type="text"
            placeholder="Поиск по имени..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none w-48 focus:w-64 transition-all text-offwhite placeholder:text-offwhite-dim"
          />
        </div>
      </header>

      <div className="glassmorphism rounded-xl border border-gold/10 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-forest-light/50 text-offwhite-dim text-sm uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Гость</th>
              <th className="px-6 py-4 font-medium">Дата и время</th>
              <th className="px-6 py-4 font-medium">Гостей</th>
              <th className="px-6 py-4 font-medium">Статус</th>
              <th className="px-6 py-4 font-medium text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/10">
            {filtered.map((booking) => (
              <tr
                key={booking.id}
                className="hover:bg-forest-light/30 transition-colors group"
              >
                <td className="px-6 py-4 font-medium text-offwhite">
                  {booking.name}
                </td>
                <td className="px-6 py-4 text-offwhite-dim text-sm">
                  {booking.datetime}
                </td>
                <td className="px-6 py-4 text-offwhite-dim text-sm">
                  {booking.guests} чел.
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider",
                      booking.status === "Confirmed" &&
                        "bg-green-500/20 text-green-400",
                      booking.status === "Pending" && "bg-gold/20 text-gold",
                      booking.status === "Completed" &&
                        "bg-offwhite-dim/20 text-offwhite-dim",
                    )}
                  >
                    {statusLabels[booking.status]}
                  </span>
                </td>
                <td className="px-6 py-4 flex justify-end gap-3">
                  <button className="text-offwhite-dim hover:text-gold transition-colors p-1">
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setBookings(bookings.filter((b) => b.id !== booking.id))
                      showToast("Бронирование удалено")
                    }}
                    className="text-offwhite-dim hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-offwhite-dim">
                  Ничего не найдено.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
