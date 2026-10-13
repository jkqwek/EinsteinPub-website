import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Loader2, LogIn } from "lucide-react"
import { login } from "./api"

export function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(username, password)
      navigate("/admin/events", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-forest">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit}
        className="glassmorphism rounded-xl p-8 w-full max-w-md space-y-6"
      >
        <div className="text-center">
          <h1 className="font-display text-3xl text-gold mb-2">EINSTEIN</h1>
          <p className="text-offwhite-dim text-sm">Вход в админ-панель</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-offwhite-dim mb-1">
              Логин
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              className="w-full bg-forest-dark/60 border border-gold/20 rounded-sm px-3 py-2 text-offwhite focus:border-gold outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-offwhite-dim mb-1">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full bg-forest-dark/60 border border-gold/20 rounded-sm px-3 py-2 text-offwhite focus:border-gold outline-none transition-colors"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-sm px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !username || !password}
          className="w-full flex items-center justify-center gap-2 bg-gold text-forest-dark font-bold uppercase text-sm py-2.5 rounded-sm hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <LogIn size={16} />
          )}
          Войти
        </button>
      </motion.form>
    </div>
  )
}