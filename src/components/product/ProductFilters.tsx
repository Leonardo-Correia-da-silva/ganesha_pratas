import { Select } from '@/components/ui/Select'
import type { Category, ProductFilters as Filters } from '@/types'

interface ProductFiltersProps {
  categories: Category[]
  selectedCategorySlug: string
  sortBy: Filters['sortBy'] | ''
  onCategoryChange: (slug: string) => void
  onSortChange: (sort: Filters['sortBy'] | '') => void
  resultCount: number
}

export function ProductFilters({
  categories,
  selectedCategorySlug,
  sortBy,
  onCategoryChange,
  onSortChange,
  resultCount,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-stone pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-1 flex-col gap-4 sm:flex-row">
        <div className="w-full sm:w-56">
          <Select
            label="Categoria"
            value={selectedCategorySlug}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-full sm:w-56">
          <Select
            label="Ordenar por"
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value as Filters['sortBy'] | '')}
          >
            <option value="">Relevância</option>
            <option value="newest">Mais recentes</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
          </Select>
        </div>
      </div>

      <p className="text-xs text-neutral-500">{resultCount} produto(s)</p>
    </div>
  )
}
