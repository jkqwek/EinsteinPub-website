import { useEffect, useState, type FormEvent } from "react"
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion"
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  EyeOff,
  Check,
  Image as ImageIcon,
  GripVertical,
} from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { adminFetch } from "./api"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Category = {
  id: number
  slug: string
  name: string
  sort_order: number
  is_active: boolean
  dish_count: number
}

type Dish = {
  id: number
  category: number
  category_name: string
  name: string
  description: string
  price: number
  weight: string
  image: string
  sort_order: number
  is_available: boolean
  created_at: string
  updated_at: string
}

type CategoryForm = { slug: string; name: string; sort_order: number; is_active: boolean }
const emptyCategory: CategoryForm = { slug: "", name: "", sort_order: 0, is_active: true }

type DishForm = { name: string; description: string; price: number; weight: string; is_available: boolean; sort_order: number; imageFile: File | null }
const emptyDish: DishForm = { name: "", description: "", price: 0, weight: "", is_available: true, sort_order: 0, imageFile: null }

function DraggableCategory({ 
  c, isSelected, onSelect, onEdit, onDelete 
}: { 
  c: Category; isSelected: boolean; onSelect: () => void; onEdit: () => void; onDelete: () => void 
}) {
  const controls = useDragControls()

  return (
    <Reorder.Item
      value={c}
      dragListener={false}
      dragControls={controls}
      onClick={onSelect}
      className={cn(
        "group flex items-center gap-2 px-3 py-3 rounded-xl cursor-pointer transition-colors border",
        isSelected ? "bg-gold/10 border-gold/30" : "hover:bg-forest-dark/50 border-transparent bg-forest-dark/20"
      )}
    >
      <div 
        onPointerDown={(e) => controls.start(e)} 
        className="cursor-grab active:cursor-grabbing p-1 text-offwhite-dim/40 hover:text-gold transition-colors touch-none"
      >
        <GripVertical size={16} />
      </div>

      <div className="flex-1 min-w-0 pointer-events-none">
        <div className={cn("truncate text-sm font-semibold", isSelected ? "text-gold" : "text-offwhite")}>
          {c.name}
        </div>
        <div className="text-[11px] text-offwhite-dim/70 mt-0.5">{c.dish_count} блюд</div>
      </div>

      {!c.is_active && <EyeOff size={14} className="text-offwhite-dim/50 shrink-0 pointer-events-none" />}

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); onEdit() }} className="p-1.5 text-offwhite-dim hover:text-gold bg-forest-dark rounded-md">
          <Pencil size={12} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="p-1.5 text-offwhite-dim hover:text-red-400 bg-forest-dark rounded-md">
          <Trash2 size={12} />
        </button>
      </div>
    </Reorder.Item>
  )
}

function DraggableDish({ 
  d, onEdit, onDelete 
}: { 
  d: Dish; onEdit: () => void; onDelete: () => void 
}) {
  const controls = useDragControls()

  return (
    <Reorder.Item
      value={d}
      dragListener={false}
      dragControls={controls}
      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-forest-dark/50 transition-colors border border-transparent hover:border-gold/10 bg-forest-dark/20"
    >
      <div 
        onPointerDown={(e) => controls.start(e)} 
        className="cursor-grab active:cursor-grabbing p-1 text-offwhite-dim/40 hover:text-gold transition-colors touch-none"
      >
        <GripVertical size={18} />
      </div>

      {d.image ? (
        <img src={d.image} alt="" className="w-14 h-14 object-cover rounded-lg border border-gold/20 shrink-0 pointer-events-none" />
      ) : (
        <div className="w-14 h-14 rounded-lg bg-forest-dark flex items-center justify-center text-offwhite-dim/30 border border-gold/10 shrink-0 pointer-events-none">
          <ImageIcon size={20} />
        </div>
      )}

      <div className="flex-1 min-w-0 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="text-offwhite font-semibold truncate text-base">{d.name}</span>
          {d.is_available ? <Check size={14} className="text-emerald-400 shrink-0" /> : <EyeOff size={14} className="text-red-400 shrink-0" />}
        </div>
        <div className="text-sm text-gold font-display mt-0.5">
          {d.price} ₽ {d.weight && <span className="text-offwhite-dim text-xs ml-1">· {d.weight}</span>}
        </div>
      </div>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-2 text-offwhite-dim hover:text-gold bg-forest-dark rounded-lg">
          <Pencil size={16} />
        </button>
        <button onClick={onDelete} className="p-2 text-offwhite-dim hover:text-red-400 bg-forest-dark rounded-lg">
          <Trash2 size={16} />
        </button>
      </div>
    </Reorder.Item>
  )
}

export function AdminMenu() {
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [dishes, setDishes] = useState<Dish[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [catModal, setCatModal] = useState<{ open: boolean; editing: Category | null }>({ open: false, editing: null })
  const [catForm, setCatForm] = useState<CategoryForm>(emptyCategory)
  const [dishModal, setDishModal] = useState<{ open: boolean; editing: Dish | null }>({ open: false, editing: null })
  const [dishForm, setDishForm] = useState<DishForm>(emptyDish)
  const [saving, setSaving] = useState(false)

  async function loadCategories() {
    setError(null)
    try {
      const res = await adminFetch("/api/admin/menu/categories/")
      if (!res.ok) throw new Error("Не удалось загрузить категории")
      const data: Category[] = await res.json()
      setCategories(data)
      if (data.length > 0 && selectedId === null) {
        setSelectedId(data[0].id)
      }
    } catch (e) {
      if (e instanceof Error && e.message === "SESSION_EXPIRED") {
        window.location.href = "/admin/login"
        return
      }
      setError(e instanceof Error ? e.message : "Ошибка")
    }
  }

  async function loadDishes(categoryId: number) {
    setDishes(null)
    try {
      const res = await adminFetch(`/api/admin/menu/dishes/?category=${categoryId}`)
      if (!res.ok) throw new Error("Не удалось загрузить блюда")
      setDishes(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка")
    }
  }

  useEffect(() => { loadCategories() }, [])

  useEffect(() => {
    if (selectedId !== null) loadDishes(selectedId)
    else setDishes([])
  }, [selectedId])

  async function onReorderCategories(newOrder: Category[]) {
    setCategories(newOrder)
    newOrder.forEach((cat, i) => {
      if (cat.sort_order !== i) {
        adminFetch(`/api/admin/menu/categories/${cat.id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: i }),
        })
      }
    })
  }

  async function onReorderDishes(newOrder: Dish[]) {
    setDishes(newOrder)
    newOrder.forEach((dish, i) => {
      if (dish.sort_order !== i) {
        adminFetch(`/api/admin/menu/dishes/${dish.id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: i }),
        })
      }
    })
  }

  function openCreateCategory() { setCatForm(emptyCategory); setCatModal({ open: true, editing: null }) }
  function openEditCategory(c: Category) { setCatForm({ slug: c.slug, name: c.name, sort_order: c.sort_order, is_active: c.is_active }); setCatModal({ open: true, editing: c }) }

  async function onSubmitCategory(e: FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const url = catModal.editing ? `/api/admin/menu/categories/${catModal.editing.id}/` : "/api/admin/menu/categories/"
      const method = catModal.editing ? "PATCH" : "POST"
      const res = await adminFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(catForm) })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const flat = Object.values(body).flat() as string[]
        throw new Error(flat[0] || "Не удалось сохранить")
      }
      
      const savedCat: Category = await res.json()
      
      if (catModal.editing) {
        setCategories(prev => prev ? prev.map(c => c.id === savedCat.id ? savedCat : c) : [savedCat])
      } else {
        setCategories(prev => prev ? [...prev, savedCat] : [savedCat])
        setSelectedId(savedCat.id)
      }
      
      setCatModal({ open: false, editing: null })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка")
    } finally {
      setSaving(false)
    }
  }

  async function onDeleteCategory(c: Category) {
    if (!confirm(`Удалить категорию «${c.name}»?\nВсе блюда в ней (${c.dish_count}) тоже удалятся.`)) return
    try {
      const res = await adminFetch(`/api/admin/menu/categories/${c.id}/`, { method: "DELETE" })
      if (!res.ok && res.status !== 204) throw new Error("Не удалось удалить")
      
      setCategories(prev => prev ? prev.filter(cat => cat.id !== c.id) : [])
      if (selectedId === c.id) setSelectedId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления")
    }
  }

  function openCreateDish() { if (selectedId === null) return; setDishForm(emptyDish); setDishModal({ open: true, editing: null }) }
  function openEditDish(d: Dish) { setDishForm({ name: d.name, description: d.description, price: d.price, weight: d.weight, is_available: d.is_available, sort_order: d.sort_order, imageFile: null }); setDishModal({ open: true, editing: d }) }

  async function onSubmitDish(e: FormEvent) {
    e.preventDefault()
    if (selectedId === null && !dishModal.editing) return
    setSaving(true); setError(null)
    try {
      const fd = new FormData()
      fd.append("name", dishForm.name)
      fd.append("description", dishForm.description)
      fd.append("price", String(dishForm.price))
      fd.append("weight", dishForm.weight)
      fd.append("is_available", String(dishForm.is_available))
      fd.append("sort_order", String(dishForm.sort_order))
      if (!dishModal.editing) fd.append("category", String(selectedId))
      if (dishForm.imageFile) fd.append("image", dishForm.imageFile)

      const url = dishModal.editing ? `/api/admin/menu/dishes/${dishModal.editing.id}/` : "/api/admin/menu/dishes/"
      const method = dishModal.editing ? "PATCH" : "POST"
      const res = await adminFetch(url, { method, body: fd })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const flat = Object.values(body).flat() as string[]
        throw new Error(flat[0] || "Не удалось сохранить")
      }
      
      const savedDish: Dish = await res.json()

      if (dishModal.editing) {
        setDishes(prev => prev ? prev.map(d => d.id === savedDish.id ? savedDish : d) : [savedDish])
      } else {
        setDishes(prev => prev ? [...prev, savedDish] : [savedDish])
        setCategories(prev => prev ? prev.map(c => c.id === selectedId ? { ...c, dish_count: c.dish_count + 1 } : c) : [])
      }
      
      setDishModal({ open: false, editing: null })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка")
    } finally {
      setSaving(false)
    }
  }

  async function onDeleteDish(d: Dish) {
    if (!confirm(`Удалить блюдо «${d.name}»?`)) return
    try {
      const res = await adminFetch(`/api/admin/menu/dishes/${d.id}/`, { method: "DELETE" })
      if (!res.ok && res.status !== 204) throw new Error("Не удалось удалить")
      
      setDishes(prev => prev ? prev.filter(dish => dish.id !== d.id) : [])
      setCategories(prev => prev ? prev.map(c => c.id === selectedId ? { ...c, dish_count: Math.max(0, c.dish_count - 1) } : c) : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления")
    }
  }

  const selectedCategory = categories?.find((c) => c.id === selectedId) ?? null

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-display text-gold mb-2">Меню</h1>
        <p className="text-offwhite-dim text-sm flex items-center gap-1">
          Перетаскивайте карточки за иконку <GripVertical size={14} className="inline text-gold/60" />, чтобы менять порядок.
        </p>
      </header>

      {error && <div className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
        {/* ЛЕВАЯ КОЛОНКА: КАТЕГОРИИ */}
        <section className="bg-forest-dark/30 border border-gold/10 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-5 shrink-0">
            <h2 className="font-display text-lg text-gold">Категории</h2>
            <button onClick={openCreateCategory} className="p-2 bg-forest-dark hover:bg-gold/10 text-offwhite-dim hover:text-gold rounded-lg transition-all" title="Добавить категорию"><Plus size={18} /></button>
          </div>

          {!categories && <Loader2 className="mx-auto text-gold animate-spin my-6" size={24} />}
          {categories && categories.length === 0 && <p className="text-offwhite-dim text-sm text-center py-6">Нет категорий. Добавь первую.</p>}

          <Reorder.Group axis="y" values={categories || []} onReorder={onReorderCategories} className="space-y-2">
            {categories?.map((c) => (
              <DraggableCategory 
                key={c.id} 
                c={c} 
                isSelected={c.id === selectedId} 
                onSelect={() => setSelectedId(c.id)} 
                onEdit={() => openEditCategory(c)} 
                onDelete={() => onDeleteCategory(c)} 
              />
            ))}
          </Reorder.Group>
        </section>

        {/* ПРАВАЯ КОЛОНКА: БЛЮДА */}
        <section className="bg-forest-dark/30 border border-gold/10 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b border-gold/10 pb-5 shrink-0">
            <h2 className="font-display text-lg text-gold">{selectedCategory ? `Блюда · ${selectedCategory.name}` : "Выберите категорию"}</h2>
            <button onClick={openCreateDish} disabled={!selectedCategory} className="flex items-center gap-2 bg-gold text-forest-dark font-bold text-xs px-4 py-2 rounded-lg hover:bg-gold-light transition-all disabled:opacity-30 disabled:cursor-not-allowed"><Plus size={16} /> Добавить блюдо</button>
          </div>

          {!selectedCategory && <p className="text-offwhite-dim text-sm text-center py-16">Выберите категорию слева, чтобы увидеть блюда.</p>}
          {selectedCategory && !dishes && <Loader2 className="mx-auto text-gold animate-spin my-6" size={24} />}
          {selectedCategory && dishes && dishes.length === 0 && <p className="text-offwhite-dim text-sm text-center py-16">В этой категории пока нет блюд.</p>}

          {selectedCategory && dishes && dishes.length > 0 && (
            <Reorder.Group axis="y" values={dishes} onReorder={onReorderDishes} className="space-y-1">
              {dishes.map((d) => (
                <DraggableDish 
                  key={d.id} 
                  d={d} 
                  onEdit={() => openEditDish(d)} 
                  onDelete={() => onDeleteDish(d)} 
                />
              ))}
            </Reorder.Group>
          )}
        </section>
      </div>

      {/* Модалка категории */}
      <AnimatePresence>
        {catModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-50 bg-[#07120c]/80 flex items-center justify-center p-4" onClick={() => setCatModal({ open: false, editing: null })}>
            <motion.form initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.15 }} onClick={(e) => e.stopPropagation()} onSubmit={onSubmitCategory} className="bg-forest-dark border border-gold/20 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-display text-gold">{catModal.editing ? "Редактировать категорию" : "Новая категория"}</h2>
                <button type="button" onClick={() => setCatModal({ open: false, editing: null })} className="p-2 text-offwhite-dim hover:text-gold transition-colors bg-forest-light/5 rounded-lg"><X size={20} /></button>
              </div>
              <div>
                <label className="block text-sm text-offwhite-dim mb-1.5">Название *</label>
                <input required value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="w-full bg-forest border border-gold/20 rounded-xl px-4 py-2.5 text-offwhite focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm text-offwhite-dim mb-1.5">Slug * (латиница: beers, wines, mains)</label>
                <input required value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })} className="w-full bg-forest border border-gold/20 rounded-xl px-4 py-2.5 text-offwhite focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer select-none bg-forest/50 p-3 rounded-xl border border-gold/10 hover:border-gold/30 transition-all">
                <input type="checkbox" checked={catForm.is_active} onChange={(e) => setCatForm({ ...catForm, is_active: e.target.checked })} className="w-5 h-5 accent-gold rounded" />
                <span className="text-sm text-offwhite font-medium">Активна (видна на сайте)</span>
              </label>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold uppercase tracking-wide text-sm bg-gold text-forest-dark hover:bg-gold-light transition-all disabled:opacity-60">
                  {saving && <Loader2 className="animate-spin" size={16} />} {catModal.editing ? "Сохранить" : "Создать"}
                </button>
                <button type="button" onClick={() => setCatModal({ open: false, editing: null })} className="px-6 py-3 rounded-xl font-bold uppercase tracking-wide text-sm border border-gold/20 text-offwhite-dim hover:text-offwhite hover:bg-forest-light/5 transition-all">Отмена</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модалка блюда */}
      <AnimatePresence>
        {dishModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-50 bg-[#07120c]/80 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setDishModal({ open: false, editing: null })}>
            <motion.form initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.15 }} onClick={(e) => e.stopPropagation()} onSubmit={onSubmitDish} className="bg-forest-dark border border-gold/20 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-5 my-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-display text-gold">{dishModal.editing ? "Редактировать блюдо" : "Новое блюдо"}</h2>
                <button type="button" onClick={() => setDishModal({ open: false, editing: null })} className="p-2 text-offwhite-dim hover:text-gold transition-colors bg-forest-light/5 rounded-lg"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm text-offwhite-dim mb-1.5">Название *</label>
                  <input required value={dishForm.name} onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })} className="w-full bg-forest border border-gold/20 rounded-xl px-4 py-2.5 text-offwhite focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-offwhite-dim mb-1.5">Цена, ₽ *</label>
                  <input required type="number" min={0} value={dishForm.price || ""} onChange={(e) => setDishForm({ ...dishForm, price: parseInt(e.target.value || "0", 10) })} className="w-full bg-forest border border-gold/20 rounded-xl px-4 py-2.5 text-offwhite focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-offwhite-dim mb-1.5">Вес / объём</label>
                  <input value={dishForm.weight} onChange={(e) => setDishForm({ ...dishForm, weight: e.target.value })} placeholder="500 мл" className="w-full bg-forest border border-gold/20 rounded-xl px-4 py-2.5 text-offwhite focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-offwhite-dim mb-1.5">Описание</label>
                  <textarea rows={3} value={dishForm.description} onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })} className="w-full bg-forest border border-gold/20 rounded-xl px-4 py-2.5 text-offwhite focus:border-gold focus:ring-1 focus:ring-gold outline-none resize-y transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-offwhite-dim mb-1.5">Фото {dishModal.editing?.image && ""}</label>
                  {dishModal.editing?.image && !dishForm.imageFile && <img src={dishModal.editing.image} alt="" className="w-full h-40 object-cover rounded-xl mb-3 border border-gold/10" />}
                  <input type="file" accept="image/*" onChange={(e) => setDishForm({ ...dishForm, imageFile: e.target.files?.[0] ?? null })} className="w-full text-sm text-offwhite-dim file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:uppercase file:bg-gold/10 file:text-gold hover:file:bg-gold hover:file:text-forest-dark file:cursor-pointer file:transition-all border border-gold/20 rounded-xl bg-forest p-2" />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer select-none bg-forest/50 p-3 rounded-xl border border-gold/10 hover:border-gold/30 transition-all">
                <input type="checkbox" checked={dishForm.is_available} onChange={(e) => setDishForm({ ...dishForm, is_available: e.target.checked })} className="w-5 h-5 accent-gold rounded" />
                <span className="text-sm text-offwhite font-medium">Доступно (видно на сайте)</span>
              </label>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold uppercase tracking-wide text-sm bg-gold text-forest-dark hover:bg-gold-light transition-all disabled:opacity-60">
                  {saving && <Loader2 className="animate-spin" size={16} />} {dishModal.editing ? "Сохранить" : "Создать"}
                </button>
                <button type="button" onClick={() => setDishModal({ open: false, editing: null })} className="px-6 py-3 rounded-xl font-bold uppercase tracking-wide text-sm border border-gold/20 text-offwhite-dim hover:text-offwhite hover:bg-forest-light/5 transition-all">Отмена</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}