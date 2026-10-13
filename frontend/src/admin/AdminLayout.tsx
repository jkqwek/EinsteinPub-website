import { useEffect } from "react"
import {NavLink, Outlet, useNavigate} from "react-router-dom"
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
      {/* Sidebar */}
      <aside className="w-64 shrink-0 glassmorphism border-r border-gold/10 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gold/10">
          <div className="font-display text-2xl text-gold font-bold">
            EINSTEIN
          </div>
          <div className="text-xs text-offwhite-dim uppercase tracking-wider mt-1">
            Админ-панель
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
           {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                cn(
                    "flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors",
                    isActive
                    ? "bg-gold/10 text-gold"
                    : "text-offwhite-dim hover:text-offwhite hover:bg-forest-dark/40",
                )
               }
            >
                <Icon size={16} />
                <span>{label}</span>
             </NavLink>
           ))}
        </nav>


        <div className="p-3 border-t border-gold/10 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm text-offwhite-dim hover:text-gold hover:bg-forest-dark/40 transition-colors"
          >
            <ExternalLink size={16} />
            Открыть сайт
          </a>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm text-offwhite-dim hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  )
}