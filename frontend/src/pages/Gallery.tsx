import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ZoomIn, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useApi, type Photo } from "../api"

export function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const { data: photos, failed } = useApi<Photo[]>("/api/gallery/")
  const images = photos ?? []

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === "Escape") setSelectedIndex(null)
      if (e.key === "ArrowLeft")
        setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : images.length - 1))
      if (e.key === "ArrowRight")
        setSelectedIndex((prev) => (prev! < images.length - 1 ? prev! + 1 : 0))
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIndex, images.length])

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-display text-gold mb-4">
          ГАЛЕРЕЯ
        </h1>
        <p className="text-offwhite-dim">
          Небольшая экскурсия по нашему заведению.
        </p>
      </motion.div>

      {!photos && !failed && (
        <Loader2 className="mx-auto text-gold animate-spin" size={32} />
      )}
      {(failed || photos?.length === 0) && (
        <p className="text-center text-offwhite-dim">
          {failed
            ? "Не удалось загрузить фото. Попробуйте обновить страницу."
            : "Скоро здесь появятся фото."}
        </p>
      )}

      <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
        {images.map((photo, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: (i % 3) * 0.1 }}
            key={photo.id}
            className="relative group cursor-pointer overflow-hidden rounded-lg break-inside-avoid"
            onClick={() => setSelectedIndex(i)}
          >
            <img
              src={photo.image}
              alt={photo.caption || "Фото из галереи"}
              loading="lazy"
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-burgundy/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gold text-forest-dark flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300 delay-100">
                <ZoomIn size={20} />
              </div>
            </div>
            <div className="absolute inset-0 border-2 border-gold/0 group-hover:border-gold/30 transition-colors duration-300 rounded-lg pointer-events-none" />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-forest-dark/90 backdrop-blur-md"
              onClick={() => setSelectedIndex(null)}
            />

            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-6 right-6 text-gold p-2 hover:bg-gold/10 rounded-full transition-colors z-10"
            >
              <X size={32} />
            </button>

            <button
              onClick={() =>
                setSelectedIndex((prev) =>
                  prev! > 0 ? prev! - 1 : images.length - 1,
                )
              }
              className="absolute left-6 top-1/2 -translate-y-1/2 text-gold p-3 hover:bg-gold/10 rounded-full transition-colors z-10"
            >
              <ChevronLeft size={32} />
            </button>

            <button
              onClick={() =>
                setSelectedIndex((prev) =>
                  prev! < images.length - 1 ? prev! + 1 : 0,
                )
              }
              className="absolute right-6 top-1/2 -translate-y-1/2 text-gold p-3 hover:bg-gold/10 rounded-full transition-colors z-10"
            >
              <ChevronRight size={32} />
            </button>

            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 max-w-5xl max-h-[85vh] w-full"
            >
              <img
                src={images[selectedIndex].image}
                alt={images[selectedIndex].caption || "Увеличенное фото"}
                className="w-full h-full object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gold/20"
              />
              {images[selectedIndex].caption && (
                <p className="mt-4 text-center text-offwhite">
                  {images[selectedIndex].caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
