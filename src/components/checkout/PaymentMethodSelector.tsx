import { cn } from '@/utils/cn'
import type { DeliveryMethod, PaymentMethod } from '@/types'

interface PaymentMethodSelectorProps {
  value: PaymentMethod
  deliveryMethod: DeliveryMethod
  onChange: (value: PaymentMethod) => void
}

const OPTIONS: Array<{ value: PaymentMethod; title: string; pickupOnly?: boolean }> = [
  { value: 'cash', title: 'Dinheiro', pickupOnly: true },
  { value: 'debit', title: 'Cartão de débito' },
  { value: 'credit', title: 'Cartão de crédito' },
  { value: 'pix', title: 'Pix' },
]

export function PaymentMethodSelector({ value, deliveryMethod, onChange }: PaymentMethodSelectorProps) {
  const availableOptions = OPTIONS.filter((option) => !option.pickupOnly || deliveryMethod === 'pickup')
  const showCreditFeeNotice = deliveryMethod === 'delivery' && value === 'credit'

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Forma de pagamento">
        {availableOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-center gap-2 border p-4 text-left text-sm font-medium transition-colors',
              value === option.value ? 'border-ink bg-offwhite text-ink' : 'border-stone text-neutral-600 hover:border-neutral-400',
            )}
          >
            {option.title}
          </button>
        ))}
      </div>

      {showCreditFeeNotice && (
        <p className="mt-3 border border-gold-light bg-gold-light/40 px-4 py-3 text-xs text-ink">
          Pagamentos com cartão de crédito na entrega têm taxa adicional. O valor da taxa será informado pela loja
          pelo WhatsApp após o pedido.
        </p>
      )}
    </div>
  )
}
