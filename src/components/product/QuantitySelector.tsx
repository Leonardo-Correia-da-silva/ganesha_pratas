import { Minus, Plus } from 'lucide-react'

interface QuantitySelectorProps {
  quantity: number
  max: number
  onChange: (quantity: number) => void
  size?: 'sm' | 'md'
}

export function QuantitySelector({ quantity, max, onChange, size = 'md' }: QuantitySelectorProps) {
  const buttonSize = size === 'sm' ? 'size-8' : 'size-10'

  return (
    <div className="inline-flex items-center border border-stone">
      <button
        type="button"
        className={`flex ${buttonSize} items-center justify-center text-ink transition-colors hover:bg-offwhite disabled:opacity-30`}
        onClick={() => onChange(Math.max(1, quantity - 1))}
        disabled={quantity <= 1}
        aria-label="Diminuir quantidade"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-10 text-center text-sm text-ink" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        className={`flex ${buttonSize} items-center justify-center text-ink transition-colors hover:bg-offwhite disabled:opacity-30`}
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        aria-label="Aumentar quantidade"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}
