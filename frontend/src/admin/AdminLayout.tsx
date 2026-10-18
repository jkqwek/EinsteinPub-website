import { useEffect } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import {
  CalendarDays,
  LogOut,
  Menu as MenuIcon,
  Images,
  ClipboardList,
  ExternalLink,
} from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isAuthed, logout } from "./api"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const navItems = [
  { to: "/admin/events", label: "События", icon: CalendarDays },
  { to: "/admin/menu", label: "Меню", icon: MenuIcon },
  { to: "/admin/gallery", label: "Галерея", icon: Images },
  { to: "/admin/bookings", label: "Брони", icon: ClipboardList },
]

export function AdminLayout() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthed()) navigate("/admin/login", { replace: true })
  }, [navigate])

  function onLogout() {
    logout()
    navigate("/admin/login", { replace: true })
  }

  return (
    <div className="min-h-screen bg-forest flex">
      <aside className="w-64 shrink-0 bg-forest-dark/80 backdrop-blur-md border-r border-gold/10 flex flex-col fixed inset-y-0 z-50">
        <div className="p-6 border-b border-gold/10">
          <div className="font-display text-2xl text-gold font-bold tracking-widest">EINSTEIN</div>
          <div className="text-xs text-offwhite-dim uppercase tracking-wider mt-1">Админ-панель</div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gold/10 text-gold"
                    : "text-offwhite-dim hover:text-offwhite hover:bg-forest-light/5"
                )
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gold/10 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-offwhite-dim hover:text-gold hover:bg-forest-light/5 transition-colors"
          >
            <ExternalLink size={18} />
            Открыть сайт
          </a>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-offwhite-dim hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Контентная часть */}
      <main className="flex-1 ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}