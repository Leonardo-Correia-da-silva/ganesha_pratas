import { cn } from '@/utils/cn'
import type { DeliveryMethod } from '@/types'

interface DeliveryMethodSelectorProps {
  value: DeliveryMethod
  onChange: (value: DeliveryMethod) => void
}

const OPTIONS: Array<{ value: DeliveryMethod; title: string; description: string }> = [
  { value: 'pickup', title: 'Retirada na loja', description: 'Jaguariúna - SP · Sem custo de frete' },
  { value: 'delivery', title: 'Entrega', description: 'Calculamos o frete pelo seu CEP' },
]

export function DeliveryMethodSelector({ value, onChange }: DeliveryMethodSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Tipo de pedido">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex flex-col items-start gap-1 border p-4 text-left transition-colors',
            value === option.value ? 'border-ink bg-offwhite' : 'border-stone hover:border-neutral-400',
          )}
        >
          <span className="text-sm font-medium text-ink">{option.title}</span>
          <span className="text-xs text-neutral-500">{option.description}</span>
        </button>
      ))}
    </div>
  )
}
