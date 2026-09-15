import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type BadgeVariant = 'new' | 'sale' | 'sold-out' | 'neutral'

const variantClasses: Record<BadgeVariant, string> = {
  new: 'bg-ink text-paper',
  sale: 'bg-gold text-ink',
  'sold-out': 'bg-neutral-500 text-paper',
  neutral: 'bg-offwhite text-ink border border-stone',
}

export function Badge({ variant = 'neutral', children }: { variant?: BadgeVariant; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest',
        variantClasses[variant],
      )}
    >
      {children}
    </span>
  )
}
