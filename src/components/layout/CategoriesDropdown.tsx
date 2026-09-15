import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import type { Category } from '@/types'

export function CategoriesDropdown({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleEnter() {
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
    setOpen(true)
  }

  function handleLeave() {
    closeTimeout.current = setTimeout(() => setOpen(false), 150)
  }

  if (categories.length === 0) return null

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        className="flex items-center gap-1 text-xs uppercase tracking-widest text-neutral-600 transition-colors hover:text-ink"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Categorias
        <ChevronDown className="size-3.5" />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-10 w-48 -translate-x-1/2 border border-stone bg-paper py-2 shadow-lg">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categoria/${category.slug}`}
              className="block px-4 py-2 text-sm text-ink hover:bg-offwhite"
              onClick={() => setOpen(false)}
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
