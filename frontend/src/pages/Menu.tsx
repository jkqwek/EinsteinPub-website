import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { formatPrice, useApi, type MenuCategory } from "../api"
import menuHero from "../assets/menu-hero.webp"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const MAIN_TABS = [
  { id: "tinctures", label: "НАСТОЙКИ", matchSlugs: ["tinctures", "nastoyki"] },
  { id: "beers", label: "ПИВО", matchSlugs: ["beers", "beer"] },
  { id: "cocktails", label: "КОКТЕЙЛИ", matchSlugs: ["cocktails", "cocktail"] },
  { 
    id: "food", 
    label: "ЕДА", 
    matchSlugs: ["food", "mains", "hot", "pizza", "snacks", "desserts", "salads"] 
  },
  { id: "all", label: "ВСЁ МЕНЮ", matchSlugs: [] },
]

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function Menu() {
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const { data: menu, loading, failed } = useApi<MenuCategory[]>("/api/menu/")
  
  const categories = (menu ?? []).filter((c) => c.dishes.length > 0)

  const filtered = categories
    .filter((c) => {
      if (!activeTab || activeTab === "all") return true
      const tab = MAIN_TABS.find((t) => t.id === activeTab)
      if (!tab) return false
      return tab.matchSlugs.includes(c.slug.toLowerCase())
    })
    .flatMap((c) => c.dishes.map((dish) => ({ ...dish, category: c.name })))

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-screen overflow-hidden">
        <img
          src={menuHero}
          alt=""
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-forest" />
      </div>

      <div className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-display text-gold mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] tracking-widest">
            МЕНЮ
          </h1>
          <p className="text-offwhite-dim text-lg md:text-xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] tracking-wide">
            Выберите раздел, чтобы ознакомиться с позициями
          </p>
        </div>

        {loading && (
          <Loader2 className="mx-auto text-gold animate-spin my-12" size={40} />
        )}

        {!loading && !failed && (
          <div className="relative mt-12">
            <AnimatePresence mode="wait">

              {activeTab === null ? (
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5, ease: smoothEase }}
                  className="flex flex-col gap-4 max-w-3xl mx-auto"
                >
                  {MAIN_TABS.map((tab, index) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="group flex items-center justify-between w-full p-6 bg-forest-dark/80 border-2 border-gold/30 hover:border-gold/80 rounded-xl transition-all duration-300 hover:bg-forest-dark/95 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                    >
                      <div className="flex items-center gap-6">
                        <span className="text-gold/60 font-display text-xl group-hover:text-gold transition-colors duration-300">
                          0{index + 1}
                        </span>
                        <span className="text-xl md:text-2xl font-bold text-offwhite group-hover:text-gold transition-colors duration-300 tracking-widest uppercase">
                          {tab.label}
                        </span>
                      </div>
                      <ArrowRight 
                        size={24} 
                        className="text-gold/50 group-hover:text-gold group-hover:translate-x-2 transition-all duration-300" 
                      />
                    </button>
                  ))}
                </motion.div>
              ) : (

                <motion.div
                  key="dishes"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5, ease: smoothEase }}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b-2 border-gold/30 pb-6 w-full">
                    <button
                      onClick={() => setActiveTab(null)}
                      className="flex items-center gap-2 text-offwhite-dim hover:text-gold transition-colors bg-forest-dark/80 border-2 border-gold/30 px-6 py-3 rounded-full hover:bg-forest-dark/95 hover:border-gold/80"
                    >
                      <ArrowLeft size={18} />
                      Назад к разделам
                    </button>
                    <h2 className="text-3xl sm:text-4xl font-display text-gold uppercase tracking-widest drop-shadow-md">
                      {MAIN_TABS.find(t => t.id === activeTab)?.label}
                    </h2>
                  </div>

                  {filtered.length === 0 ? (
                    <p className="text-center text-offwhite-dim text-lg py-12 bg-forest-dark/80 border-2 border-gold/20 rounded-xl w-full">
                      В этой категории пока нет позиций.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {filtered.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl overflow-hidden flex flex-col group cursor-pointer border-2 border-gold/20 hover:border-gold/60 transition-all duration-300 bg-forest-dark/90 hover:shadow-[0_12px_40px_-8px_rgba(97,24,32,0.8)]"
                        >
                          {item.image && (
                            <div className="relative aspect-[16/9] overflow-hidden border-b-2 border-gold/20">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <span className="absolute top-3 left-3 bg-burgundy text-gold-light text-[10px] sm:text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-sm shadow-md">
                                {item.category}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 p-4 flex flex-col border-t-4 border-gold">
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <h3 className="min-w-0 break-words hyphens-auto font-display font-bold text-base group-hover:text-gold transition-colors text-offwhite leading-tight">
                                {item.name}
                              </h3>
                              <span className="shrink-0 whitespace-nowrap text-gold font-display font-bold text-base">
                                {formatPrice(item.price)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-1 bg-gold rounded-full" />
                              {item.weight && (
                                <span className="text-[11px] font-semibold tracking-wide text-offwhite-dim">
                                  {item.weight}
                                </span>
                              )}
                            </div>
                            <p className="text-offwhite-dim text-xs leading-relaxed line-clamp-3">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {failed && (
          <p className="text-center text-offwhite-dim text-lg drop-shadow-md py-12">
            Не удалось загрузить меню. Попробуйте обновить страницу.
          </p>
        )}
      </div>
    </div>
  )
}