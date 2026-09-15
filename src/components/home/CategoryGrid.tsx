import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Category } from '@/types'

interface CategoryGridProps {
  categories: Category[]
  loading?: boolean
}

export function CategoryGrid({ categories, loading }: CategoryGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[4/5] w-full" />
        ))}
      </div>
    )
  }

  if (categories.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
      {categories.map((category) => (
        <Link key={category.id} to={`/categoria/${category.slug}`} className="group relative block">
          <div className="aspect-[4/5] overflow-hidden bg-offwhite">
            {category.imageUrl ? (
              <img
                src={category.imageUrl}
                alt={category.name}
                loading="lazy"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-ink">
                <span className="font-display text-lg text-gold-soft">{category.name}</span>
              </div>
            )}
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/70 via-transparent to-transparent p-4">
              <span className="font-display text-base text-paper md:text-lg">{category.name}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
