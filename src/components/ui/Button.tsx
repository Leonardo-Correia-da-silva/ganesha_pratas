import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink-soft',
  secondary: 'bg-gold text-ink hover:bg-gold-soft',
  ghost: 'bg-transparent text-ink hover:bg-offwhite',
  outline: 'bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-4 py-2 tracking-wide',
  md: 'text-sm px-6 py-3 tracking-wide',
  lg: 'text-sm px-8 py-4 tracking-widest',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 uppercase font-medium transition-all duration-300',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
