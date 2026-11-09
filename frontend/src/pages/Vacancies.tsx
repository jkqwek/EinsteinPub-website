import React, { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Check, Clock, Loader2, Wallet } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createApplication, useApi, type Vacancy } from "../api"
import { FormulaBackdrop } from "../components/FormulaBackdrop"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Physics' "work" for a page about work: A = F·s, power, efficiency, energy.
// Its own tile size and tilts, so the scatter differs from Events and Gallery.
const workPattern = {
  image: `url("data:image/svg+xml,${encodeURIComponent(`<svg width='380' height='300' xmlns='http://www.w3.org/2000/svg' font-family='serif' fill='#fabc55'>
    <text x='22' y='72' font-size='40' transform='rotate(-9 22 72)'>A = F·s</text>
    <text x='236' y='44' font-size='28' transform='rotate(10 236 44)'>P = A/t</text>
    <text x='146' y='150' font-size='22' transform='rotate(-5 146 150)'>η = A₁/A₂</text>
    <text x='24' y='236' font-size='24' transform='rotate(7 24 236)'>A = ΔE</text>
    <text x='186' y='262' font-size='24' transform='rotate(-8 186 262)'>Eₖ = mv²/2</text>
    <text x='318' y='176' font-size='54' transform='rotate(-14 318 176)'>η</text>
  </svg>`)}")`,
  size: "380px 300px",
}

// Same limits as backend/apps/careers/serializers.py
const maxResumeSize = 5 * 1024 * 1024
const resumeTypes = ".pdf,.doc,.docx"

const inputClass =
  "w-full bg-forest-dark border border-gold/20 rounded-lg px-4 py-3 text-offwhite outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
const labelClass = "text-offwhite-dim text-sm uppercase font-bold mb-2 block"

export function Vacancies() {
  const { data: vacancies, loading, failed } = useApi<Vacancy[]>("/api/vacancies/")
  const [vacancyId, setVacancyId] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [about, setAbout] = useState("")
  const [resume, setResume] = useState<File | null>(null)
  const [adult, setAdult] = useState(false)
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")
  const [message, setMessage] = useState("")
  const formRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  function applyFor(v: Vacancy) {
    setVacancyId(String(v.id))
    setStatus("idle")
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    nameRef.current?.focus({ preventScroll: true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resume && !about.trim()) {
      setMessage("Приложите файл резюме или расскажите о себе.")
      return
    }
    if (resume && resume.size > maxResumeSize) {
      setMessage("Файл резюме больше 5 МБ.")
      return
    }

    const form = new FormData()
    if (vacancyId) form.append("vacancy", vacancyId)
    form.append("name", name)
    form.append("phone", phone)
    form.append("email", email)
    form.append("about", about)
    if (resume) form.append("resume", resume)
    form.append("adult", String(adult))
    form.append("consent", String(consent))

    setStatus("loading")
    setMessage("")
    try {
      await createApplication(form)
      setStatus("success")
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    } catch (err) {
      setMessage((err as Error).message)
      setStatus("idle")
    }
  }

  function reset() {
    setVacancyId(""); setAbout(""); setResume(null); setStatus("idle")
  }

  return (
    <FormulaBackdrop pattern={workPattern}>
      <div className="relative pt-32 pb-24 px-6 max-w-5xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display text-gold mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] tracking-widest">
            ВАКАНСИИ
          </h1>
          <p className="text-offwhite-dim text-lg md:text-xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] tracking-wide">
            Ищем в команду тех, кто любит гостей и своё дело.
          </p>
        </motion.div>

        {loading && <Loader2 className="mx-auto text-gold animate-spin my-12" size={40} />}

        {failed && (
          <p className="text-center text-offwhite-dim text-lg drop-shadow-md pb-12">
            Не удалось загрузить вакансии. Попробуйте обновить страницу.
          </p>
        )}

        {vacancies && vacancies.length === 0 && (
          <p className="text-center text-offwhite-dim text-lg bg-forest-dark/60 border border-gold/10 rounded-2xl max-w-2xl mx-auto px-6 py-10 mb-16 backdrop-blur-sm">
            Сейчас открытых вакансий нет. Оставьте резюме — позвоним, когда появится место.
          </p>
        )}

        {vacancies && vacancies.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-20">
            {vacancies.map((v) => (
              <article
                key={v.id}
                className="flex flex-col rounded-2xl border border-gold/20 bg-forest-dark/60 backdrop-blur-sm p-6 hover:border-gold/50 hover:shadow-[0_12px_40px_-8px_rgba(97,24,32,0.8)] transition-all duration-300"
              >
                <h2 className="text-2xl font-display text-offwhite mb-3">{v.title}</h2>
                {(v.schedule || v.salary) && (
                  <div className="flex flex-wrap gap-2 mb-4 text-sm">
                    {v.salary && (
                      <span className="flex items-center gap-2 text-gold bg-gold/10 border border-gold/20 px-3 py-1.5 rounded-lg">
                        <Wallet size={16} /> {v.salary}
                      </span>
                    )}
                    {v.schedule && (
                      <span className="flex items-center gap-2 text-offwhite-dim bg-forest border border-gold/10 px-3 py-1.5 rounded-lg">
                        <Clock size={16} className="text-gold" /> {v.schedule}
                      </span>
                    )}
                  </div>
                )}
                {v.description && (
                  <p className="text-offwhite-dim text-sm leading-relaxed whitespace-pre-line mb-6">
                    {v.description}
                  </p>
                )}
                <button
                  onClick={() => applyFor(v)}
                  className="mt-auto self-start px-6 py-2.5 bg-gold text-forest-dark font-bold uppercase text-sm rounded-sm hover:bg-gold-light transition-colors"
                >
                  Откликнуться
                </button>
              </article>
            ))}
          </div>
        )}

        <div ref={formRef} className="max-w-2xl mx-auto scroll-mt-28">
          <h2 className="text-3xl md:text-4xl font-display text-gold text-center mb-8">
            Отправить резюме
          </h2>

          {status === "success" ? (
            <div className="glassmorphism p-10 rounded-2xl text-center" role="status">
              <div className="w-16 h-16 bg-burgundy ring-4 ring-burgundy/30 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
                <Check size={32} />
              </div>
              <p className="text-xl font-display text-offwhite mb-3">Резюме отправлено</p>
              <p className="text-offwhite-dim mb-8">
                Мы прочитаем его и позвоним по номеру {phone}, если ваш опыт нам подойдёт.
              </p>
              <button
                onClick={reset}
                className="px-6 py-2 border border-gold text-gold rounded hover:bg-gold/10 transition-colors"
              >
                Отправить ещё одно
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glassmorphism p-8 rounded-2xl border border-gold/10">
              <div className="mb-6">
                <label htmlFor="apply-vacancy" className={labelClass}>Вакансия</label>
                <select
                  id="apply-vacancy"
                  value={vacancyId}
                  onChange={(e) => setVacancyId(e.target.value)}
                  className={cn(inputClass, "[color-scheme:dark]")}
                >
                  <option value="">Любая вакансия</option>
                  {vacancies?.map((v) => (
                    <option key={v.id} value={v.id}>{v.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="apply-name" className={labelClass}>Имя</label>
                  <input
                    id="apply-name"
                    ref={nameRef}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="apply-phone" className={labelClass}>Телефон</label>
                  <input
                    id="apply-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+7 (900) 000-00-00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={30}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="apply-email" className={labelClass}>
                  Email <span className="normal-case font-normal">— необязательно</span>
                </label>
                <input
                  id="apply-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={254}
                  className={inputClass}
                />
              </div>

              <p className="text-offwhite-dim text-sm mb-4">
                Приложите файл резюме или расскажите о себе — хватит чего-то одного.
              </p>

              <div className="mb-6">
                <label htmlFor="apply-about" className={labelClass}>О себе и опыт работы</label>
                <textarea
                  id="apply-about"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  maxLength={3000}
                  className={cn(inputClass, "h-32 resize-none")}
                  placeholder="Где и кем работали, почему хотите к нам"
                />
              </div>

              <div className="mb-8">
                <label htmlFor="apply-resume" className={labelClass}>Файл резюме</label>
                <input
                  id="apply-resume"
                  type="file"
                  accept={resumeTypes}
                  onChange={(e) => setResume(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-offwhite-dim file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-bold file:uppercase file:bg-gold/10 file:text-gold hover:file:bg-gold hover:file:text-forest-dark file:cursor-pointer file:transition-all border border-gold/20 rounded-lg bg-forest-dark p-2"
                />
                <p className="text-offwhite-dim text-xs mt-2">PDF, DOC или DOCX, до 5 МБ.</p>
              </div>

              <label className="flex items-start gap-3 mb-4 text-sm text-offwhite-dim cursor-pointer">
                <input
                  type="checkbox"
                  checked={adult}
                  onChange={(e) => setAdult(e.target.checked)}
                  className="mt-1 accent-gold"
                  required
                />
                <span>Мне исполнилось 18 лет</span>
              </label>

              <label className="flex items-start gap-3 mb-8 text-sm text-offwhite-dim cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 accent-gold"
                  required
                />
                <span>
                  Соглашаюсь на обработку персональных данных согласно{" "}
                  <Link to="/privacy" target="_blank" className="text-gold underline hover:text-gold-light">
                    политике конфиденциальности
                  </Link>
                </span>
              </label>

              {message && (
                <p role="alert" className="text-red-400 text-sm text-center mb-4">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-gold text-forest-dark font-bold uppercase py-4 rounded-lg hover:bg-gold-light transition-colors flex items-center justify-center gap-2"
              >
                {status === "loading" ? <Loader2 className="animate-spin" size={20} /> : "Отправить резюме"}
              </button>
            </form>
          )}
        </div>
      </div>
    </FormulaBackdrop>
  )
}
