import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, Loader2, ImageOff } from "lucide-react"
import { clsx } from "clsx"
import { useApi, type Photo } from "../api"
import { FormulaBackdrop } from "../components/FormulaBackdrop"

// Mosaic rhythm: every 5th photo is a 2×2 tile, alternating left and right.
// Only when 4 more photos follow to fill the space beside it, so the last row has no hole.
function tileClass(i: number, count: number) {
  if (i % 5 !== 0 || i + 4 >= count) return ""
  return clsx("col-span-2 row-span-2", (i / 5) % 2 === 1 && "md:col-start-2 lg:col-start-3")
}

// Optics instead of the Events formulas: a photo is made of light, and the photoelectric effect (E = hν)
// won Einstein his Nobel. A wider, flatter tile than on Events, with gentler tilts, so the scatter differs too.
const opticsPattern = {
  image: `url("data:image/svg+xml,${encodeURIComponent(`<svg width='400' height='320' xmlns='http://www.w3.org/2000/svg' font-family='serif' fill='#fabc55'>
    <text x='24' y='84' font-size='44' transform='rotate(-8 24 84)'>E = hν</text>
    <text x='262' y='30' font-size='30' transform='rotate(12 262 30)'>c = λν</text>
    <text x='160' y='160' font-size='22' transform='rotate(-4 160 160)'>1/F = 1/d + 1/f</text>
    <text x='20' y='244' font-size='20' transform='rotate(6 20 244)'>n₁ sin α = n₂ sin β</text>
    <text x='336' y='118' font-size='56' transform='rotate(-18 336 118)'>λ</text>
    <text x='236' y='288' font-size='26' transform='rotate(14 236 288)'>f/1.8</text>
  </svg>`)}")`,
  size: "400px 320px",
}

export function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const { data: photos, loading, failed } = useApi<Photo[]>("/api/gallery/")
  const images = photos ?? []
  const selected = selectedIndex === null ? null : images[selectedIndex]

  // Move through the photos in the viewer, wrapping around at both ends
  const step = (by: number) =>
    setSelectedIndex((i) => (i === null ? i : (i + by + images.length) % images.length))

  useEffect(() => {
    if (selectedIndex === null) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null)
      if (e.key === "ArrowLeft") step(-1)
      if (e.key === "ArrowRight") step(1)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIndex, images.length])

  return (
    <FormulaBackdrop pattern={opticsPattern}>
      <div className="relative pt-32 pb-24 px-6 max-w-6xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-display text-gold mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] tracking-widest">
            ГАЛЕРЕЯ
          </h1>
          <p className="text-offwhite-dim text-lg md:text-xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] tracking-wide">
            Небольшая экскурсия по нашему заведению.
          </p>
        </motion.div>

        {loading && <Loader2 className="mx-auto text-gold animate-spin my-12" size={40} />}

        {failed && (
          <p className="text-center text-offwhite-dim text-lg drop-shadow-md py-12">
            Не удалось загрузить фото. Попробуйте обновить страницу.
          </p>
        )}

        {photos?.length === 0 && (
          <div className="text-center py-20 bg-forest-dark/60 border border-gold/10 rounded-2xl max-w-2xl mx-auto backdrop-blur-sm">
            <ImageOff size={48} className="mx-auto text-gold/50 mb-4 drop-shadow-md" />
            <p className="text-offwhite-dim text-lg">Скоро здесь появятся фото.</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-flow-row-dense auto-rows-[160px] md:auto-rows-[200px] lg:auto-rows-[240px] gap-3 md:gap-4">
          {images.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={clsx(
                "group relative overflow-hidden rounded-xl border border-gold/20 bg-forest-dark/50 cursor-zoom-in transition-all duration-300 hover:border-gold/50 hover:shadow-[0_12px_40px_-8px_rgba(97,24,32,0.8)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                tileClass(i, images.length),
              )}
            >
              <img
                src={photo.image}
                alt={photo.caption || "Фото из галереи"}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {photo.caption && (
                <span className="absolute inset-x-0 bottom-0 p-4 pt-10 text-left text-sm font-semibold text-offwhite bg-gradient-to-t from-black/75 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {photo.caption}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Просмотр фото"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 md:px-24"
          >
            <div
              className="absolute inset-0 bg-forest-dark/90 backdrop-blur-md"
              onClick={() => setSelectedIndex(null)}
            />

            <span className="absolute top-7 left-6 z-10 font-display text-sm text-offwhite-dim">
              {selectedIndex! + 1} / {images.length}
            </span>

            <button
              onClick={() => setSelectedIndex(null)}
              aria-label="Закрыть"
              className="absolute top-6 right-6 text-gold p-2 hover:bg-gold/10 rounded-full transition-colors z-10"
            >
              <X size={32} />
            </button>

            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, { offset }) => {
                if (offset.x < -80) step(1)
                else if (offset.x > 80) step(-1)
              }}
              className="relative z-10 w-full max-w-5xl"
            >
              <img
                src={selected.image}
                alt={selected.caption || "Увеличенное фото"}
                draggable={false}
                className="max-w-full max-h-[70vh] md:max-h-[80vh] mx-auto object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gold/20"
              />
              {selected.caption && (
                <p className="mt-4 text-center text-offwhite">{selected.caption}</p>
              )}
            </motion.div>

            {/* Arrows sit under the photo on phones; from md the wrapper dissolves and they move to the screen edges */}
            <div className="relative z-10 mt-6 flex gap-6 md:contents">
              <button
                onClick={() => step(-1)}
                aria-label="Предыдущее фото"
                className="text-gold p-3 hover:bg-gold/10 rounded-full transition-colors md:absolute md:left-6 md:top-1/2 md:-translate-y-1/2 md:z-10"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={() => step(1)}
                aria-label="Следующее фото"
                className="text-gold p-3 hover:bg-gold/10 rounded-full transition-colors md:absolute md:right-6 md:top-1/2 md:-translate-y-1/2 md:z-10"
              >
                <ChevronRight size={32} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </FormulaBackdrop>
  )
}
