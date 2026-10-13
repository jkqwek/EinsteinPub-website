import { useEffect, useState, type FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Check,
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

// --- Модалка категории ---
type CategoryForm = {
  slug: string
  name: string
  sort_order: number
  is_active: boolean
}

const emptyCategory: CategoryForm = {
  slug: "",
  name: "",
  sort_order: 0,
  is_active: true,
}

// --- Модалка блюда ---
type DishForm = {
  name: string
  description: string
  price: number
  weight: string
  is_available: boolean
  sort_order: number
  imageFile: File | null
}

const emptyDish: DishForm = {
  name: "",
  description: "",
  price: 0,
  weight: "",
  is_available: true,
  sort_order: 0,
  imageFile: null,
}

export function AdminMenu() {
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [dishes, setDishes] = useState<Dish[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [catModal, setCatModal] = useState<{
    open: boolean
    editing: Category | null
  }>({ open: false, editing: null })
  const [catForm, setCatForm] = useState<CategoryForm>(emptyCategory)

  const [dishModal, setDishModal] = useState<{
    open: boolean
    editing: Dish | null
  }>({ open: false, editing: null })
  const [dishForm, setDishForm] = useState<DishForm>(emptyDish)

  const [saving, setSaving] = useState(false)

  // --- Загрузка категорий ---
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

  // --- Загрузка блюд выбранной категории ---
  async function loadDishes(categoryId: number) {
    setDishes(null)
    try {
      const res = await adminFetch(
        `/api/admin/menu/dishes/?category=${categoryId}`,
      )
      if (!res.ok) throw new Error("Не удалось загрузить блюда")
      setDishes(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка")
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (selectedId !== null) loadDishes(selectedId)
  }, [selectedId])

  // --- Перестановка (стрелки) ---
  async function moveCategory(index: number, direction: -1 | 1) {
    if (!categories) return
    const target = index + direction
    if (target < 0 || target >= categories.length) return
    const a = categories[index]
    const b = categories[target]
    await Promise.all([
      adminFetch(`/api/admin/menu/categories/${a.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: b.sort_order }),
      }),
      adminFetch(`/api/admin/menu/categories/${b.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: a.sort_order }),
      }),
    ])
    await loadCategories()
  }

  async function moveDish(index: number, direction: -1 | 1) {
    if (!dishes) return
    const target = index + direction
    if (target < 0 || target >= dishes.length) return
    const a = dishes[index]
    const b = dishes[target]
    await Promise.all([
      adminFetch(`/api/admin/menu/dishes/${a.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: b.sort_order }),
      }),
      adminFetch(`/api/admin/menu/dishes/${b.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: a.sort_order }),
      }),
    ])
    if (selectedId !== null) loadDishes(selectedId)
  }

  // --- Категории: CRUD ---
  function openCreateCategory() {
    setCatForm(emptyCategory)
    setCatModal({ open: true, editing: null })
  }

  function openEditCategory(c: Category) {
    setCatForm({
      slug: c.slug,
      name: c.name,
      sort_order: c.sort_order,
      is_active: c.is_active,
    })
    setCatModal({ open: true, editing: c })
  }

  async function onSubmitCategory(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const url = catModal.editing
        ? `/api/admin/menu/categories/${catModal.editing.id}/`
        : "/api/admin/menu/categories/"
      const method = catModal.editing ? "PATCH" : "POST"
      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(catForm),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const flat = Object.values(body).flat() as string[]
        throw new Error(flat[0] || "Не удалось сохранить")
      }
      setCatModal({ open: false, editing: null })
      await loadCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка")
    } finally {
      setSaving(false)
    }
  }

  async function onDeleteCategory(c: Category) {
    if (
      !confirm(
        `Удалить категорию «${c.name}»?\nВсе блюда в ней (${c.dish_count}) тоже удалятся.`,
      )
    )
      return
    try {
      const res = await adminFetch(`/api/admin/menu/categories/${c.id}/`, {
        method: "DELETE",
      })
      if (!res.ok && res.status !== 204) throw new Error("Не удалось удалить")
      if (selectedId === c.id) setSelectedId(null)
      await loadCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления")
    }
  }

  // --- Блюда: CRUD ---
  function openCreateDish() {
    if (selectedId === null) return
    setDishForm(emptyDish)
    setDishModal({ open: true, editing: null })
  }

  function openEditDish(d: Dish) {
    setDishForm({
      name: d.name,
      description: d.description,
      price: d.price,
      weight: d.weight,
      is_available: d.is_available,
      sort_order: d.sort_order,
      imageFile: null,
    })
    setDishModal({ open: true, editing: d })
  }

  async function onSubmitDish(e: FormEvent) {
    e.preventDefault()
    if (selectedId === null && !dishModal.editing) return
    setSaving(true)
    setError(null)
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

      const url = dishModal.editing
        ? `/api/admin/menu/dishes/${dishModal.editing.id}/`
        : "/api/admin/menu/dishes/"
      const method = dishModal.editing ? "PATCH" : "POST"
      const res = await adminFetch(url, { method, body: fd })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const flat = Object.values(body).flat() as string[]
        throw new Error(flat[0] || "Не удалось сохранить")
      }
      setDishModal({ open: false, editing: null })
      if (selectedId !== null) await loadDishes(selectedId)
      await loadCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка")
    } finally {
      setSaving(false)
    }
  }

  async function onDeleteDish(d: Dish) {
    if (!confirm(`Удалить блюдо «${d.name}»?`)) return
    try {
      const res = await adminFetch(`/api/admin/menu/dishes/${d.id}/`, {
        method: "DELETE",
      })
      if (!res.ok && res.status !== 204) throw new Error("Не удалось удалить")
      if (selectedId !== null) await loadDishes(selectedId)
      await loadCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка")
    }
  }

  const selectedCategory = categories?.find((c) => c.id === selectedId) ?? null

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-display text-gold mb-1">Меню</h1>
        <p className="text-offwhite-dim text-sm">
          Категории и блюда. Стрелки ↑↓ меняют порядок, «глаз» скрывает с сайта.
        </p>
      </header>

      {error && (
        <div className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Категории */}
        <section className="glassmorphism rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-gold">Категории</h2>
            <button
              onClick={openCreateCategory}
              className="p-1.5 text-offwhite-dim hover:text-gold transition-colors"
              title="Добавить категорию"
            >
              <Plus size={18} />
            </button>
          </div>

          {!categories && (
            <Loader2 className="mx-auto text-gold animate-spin my-6" size={24} />
          )}

          {categories && categories.length === 0 && (
            <p className="text-offwhite-dim text-sm text-center py-6">
              Нет категорий. Добавь первую.
            </p>
          )}

          <ul className="space-y-1">
            {categories?.map((c, i) => (
              <li key={c.id}>
                <div
                  className={cn(
                    "group flex items-center gap-2 px-2 py-2 rounded-sm cursor-pointer transition-colors",
                    c.id === selectedId
                      ? "bg-gold/10 text-gold"
                      : "text-offwhite hover:bg-forest-dark/40",
                  )}
                  onClick={() => setSelectedId(c.id)}
                >
                  <div className="flex flex-col -my-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveCategory(i, -1)
                      }}
                      className="text-offwhite-dim hover:text-gold"
                      disabled={i === 0}
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveCategory(i, 1)
                      }}
                      className="text-offwhite-dim hover:text-gold"
                      disabled={i === categories.length - 1}
                    >
                      <ChevronDown size={12} />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-offwhite-dim">
                      {c.slug} · {c.dish_count} блюд
                    </div>
                  </div>

                  {!c.is_active && (
                    <EyeOff size={12} className="text-offwhite-dim shrink-0" />
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditCategory(c)
                    }}
                    className="p-1 text-offwhite-dim hover:text-gold opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Редактировать"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteCategory(c)
                    }}
                    className="p-1 text-offwhite-dim hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Удалить"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Блюда выбранной категории */}
        <section className="glassmorphism rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-gold">
              {selectedCategory
                ? `Блюда · ${selectedCategory.name}`
                : "Блюда"}
            </h2>
            <button
              onClick={openCreateDish}
              disabled={!selectedCategory}
              className="flex items-center gap-2 bg-gold text-forest-dark font-bold uppercase text-xs px-3 py-1.5 rounded-sm hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={14} /> Добавить
            </button>
          </div>

          {!selectedCategory && (
            <p className="text-offwhite-dim text-sm text-center py-12">
              Выбери категорию слева.
            </p>
          )}

          {selectedCategory && !dishes && (
            <Loader2 className="mx-auto text-gold animate-spin my-6" size={24} />
          )}

          {selectedCategory && dishes && dishes.length === 0 && (
            <p className="text-offwhite-dim text-sm text-center py-12">
              В этой категории пока нет блюд.
            </p>
          )}

          {selectedCategory && dishes && dishes.length > 0 && (
            <ul className="space-y-2">
              {dishes.map((d, i) => (
                <li
                  key={d.id}
                  className="group flex items-center gap-3 p-2 rounded-sm hover:bg-forest-dark/40 transition-colors"
                >
                  <div className="flex flex-col -my-1">
                    <button
                      onClick={() => moveDish(i, -1)}
                      className="text-offwhite-dim hover:text-gold"
                      disabled={i === 0}
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => moveDish(i, 1)}
                      className="text-offwhite-dim hover:text-gold"
                      disabled={i === dishes.length - 1}
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  {d.image && (
                    <img
                      src={d.image}
                      alt=""
                      className="w-12 h-12 object-cover rounded-sm shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-offwhite font-medium truncate">
                        {d.name}
                      </span>
                      {d.is_available ? (
                        <Check size={12} className="text-gold shrink-0" />
                      ) : (
                        <EyeOff size={12} className="text-offwhite-dim shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-offwhite-dim truncate">
                      {d.price} ₽ {d.weight && `· ${d.weight}`}
                    </div>
                  </div>

                  <button
                    onClick={() => openEditDish(d)}
                    className="p-2 text-offwhite-dim hover:text-gold transition-colors"
                    title="Редактировать"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteDish(d)}
                    className="p-2 text-offwhite-dim hover:text-red-400 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Модалка категории */}
      <AnimatePresence>
        {catModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-forest-dark/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setCatModal({ open: false, editing: null })}
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={onSubmitCategory}
              className="glassmorphism rounded-xl p-6 w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-display text-gold">
                  {catModal.editing ? "Категория" : "Новая категория"}
                </h2>
                <button
                  type="button"
                  onClick={() => setCatModal({ open: false, editing: null })}
                  className="p-2 text-offwhite-dim hover:text-gold"
                >
                  <X size={20} />
                </button>
              </div>

              <div>
                <label className="block text-sm text-offwhite-dim mb-1">
                  Название *
                </label>
                <input
                  required
                  value={catForm.name}
                  onChange={(e) =>
                    setCatForm({ ...catForm, name: e.target.value })
                  }
                  className="w-full bg-forest-dark/60 border border-gold/20 rounded-sm px-3 py-2 text-offwhite focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-offwhite-dim mb-1">
                  Slug * (латиница, без пробелов: Beers, Wines)
                </label>
                <input
                  required
                  value={catForm.slug}
                  onChange={(e) =>
                    setCatForm({ ...catForm, slug: e.target.value })
                  }
                  className="w-full bg-forest-dark/60 border border-gold/20 rounded-sm px-3 py-2 text-offwhite focus:border-gold outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={catForm.is_active}
                  onChange={(e) =>
                    setCatForm({ ...catForm, is_active: e.target.checked })
                  }
                  className="w-4 h-4 accent-gold"
                />
                <span className="text-sm text-offwhite">
                  Активна (видна на сайте)
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm font-bold uppercase text-sm bg-gold text-forest-dark hover:bg-gold-light transition-colors disabled:opacity-60"
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  {catModal.editing ? "Сохранить" : "Создать"}
                </button>
                <button
                  type="button"
                  onClick={() => setCatModal({ open: false, editing: null })}
                  className="px-6 py-2.5 rounded-sm font-bold uppercase text-sm border border-gold/30 text-offwhite-dim hover:text-offwhite"
                >
                  Отмена
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модалка блюда */}
      <AnimatePresence>
        {dishModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-forest-dark/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setDishModal({ open: false, editing: null })}
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={onSubmitDish}
              className="glassmorphism rounded-xl p-6 w-full max-w-2xl space-y-4 my-8"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-display text-gold">
                  {dishModal.editing ? "Редактировать блюдо" : "Новое блюдо"}
                </h2>
                <button
                  type="button"
                  onClick={() => setDishModal({ open: false, editing: null })}
                  className="p-2 text-offwhite-dim hover:text-gold"
                >
                  <X size={20} />
                </button>
              </div>

              <div>
                <label className="block text-sm text-offwhite-dim mb-1">
                  Название *
                </label>
                <input
                  required
                  value={dishForm.name}
                  onChange={(e) =>
                    setDishForm({ ...dishForm, name: e.target.value })
                  }
                  className="w-full bg-forest-dark/60 border border-gold/20 rounded-sm px-3 py-2 text-offwhite focus:border-gold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-offwhite-dim mb-1">
                    Цена, ₽ *
                  </label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={dishForm.price || ""}
                    onChange={(e) =>
                      setDishForm({
                        ...dishForm,
                        price: parseInt(e.target.value || "0", 10),
                      })
                    }
                    className="w-full bg-forest-dark/60 border border-gold/20 rounded-sm px-3 py-2 text-offwhite focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-offwhite-dim mb-1">
                    Вес / объём
                  </label>
                  <input
                    value={dishForm.weight}
                    onChange={(e) =>
                      setDishForm({ ...dishForm, weight: e.target.value })
                    }
                    placeholder="500 мл"
                    className="w-full bg-forest-dark/60 border border-gold/20 rounded-sm px-3 py-2 text-offwhite focus:border-gold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-offwhite-dim mb-1">
                  Описание
                </label>
                <textarea
                  rows={3}
                  value={dishForm.description}
                  onChange={(e) =>
                    setDishForm({ ...dishForm, description: e.target.value })
                  }
                  className="w-full bg-forest-dark/60 border border-gold/20 rounded-sm px-3 py-2 text-offwhite focus:border-gold outline-none resize-y"
                />
              </div>

              <div>
                <label className="block text-sm text-offwhite-dim mb-1">
                  Фото{" "}
                  {dishModal.editing?.image && "(оставь пустым, чтобы не менять)"}
                </label>
                {dishModal.editing?.image && !dishForm.imageFile && (
                  <img
                    src={dishModal.editing.image}
                    alt=""
                    className="w-full h-32 object-cover rounded-sm mb-2"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setDishForm({
                      ...dishForm,
                      imageFile: e.target.files?.[0] ?? null,
                    })
                  }
                  className="w-full text-sm text-offwhite-dim file:mr-3 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-bold file:uppercase file:bg-gold file:text-forest-dark hover:file:bg-gold-light file:cursor-pointer"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dishForm.is_available}
                  onChange={(e) =>
                    setDishForm({ ...dishForm, is_available: e.target.checked })
                  }
                  className="w-4 h-4 accent-gold"
                />
                <span className="text-sm text-offwhite">
                  Доступно (видно на сайте)
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm font-bold uppercase text-sm bg-gold text-forest-dark hover:bg-gold-light transition-colors disabled:opacity-60"
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  {dishModal.editing ? "Сохранить" : "Создать"}
                </button>
                <button
                  type="button"
                  onClick={() => setDishModal({ open: false, editing: null })}
                  className="px-6 py-2.5 rounded-sm font-bold uppercase text-sm border border-gold/30 text-offwhite-dim hover:text-offwhite"
                >
                  Отмена
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}