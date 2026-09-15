import type { LucideIcon } from 'lucide-react'
import { PackageX } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon = PackageX, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <Icon className="size-10 text-neutral-400" strokeWidth={1.25} aria-hidden />
      <p className="font-display text-xl text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-neutral-500">{description}</p>}
      {action}
    </div>
  )
}
