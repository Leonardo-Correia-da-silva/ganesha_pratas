import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import type { Category } from '@/types'

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  categories: Category[]
}

const NAV_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Produtos', to: '/produtos' },
  { label: 'Novidades', to: '/produtos?novidades=true' },
  { label: 'Sobre', to: '/#sobre' },
  { label: 'Contato', to: '/#contato' },
]

export function MobileDrawer({ open, onClose, categories }: MobileDrawerProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-ink/50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-[85vw] max-w-sm flex-col bg-paper transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-stone px-6 py-5">
          <span className="font-display text-lg">Menu</span>
          <button onClick={onClose} aria-label="Fechar menu" className="p-1">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto px-6 py-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className="border-b border-stone py-3.5 text-base text-ink"
            >
              {link.label}
            </Link>
          ))}

          {categories.length > 0 && (
            <>
              <p className="pt-6 text-xs uppercase tracking-widest text-neutral-500">Categorias</p>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categoria/${category.slug}`}
                  onClick={onClose}
                  className="border-b border-stone py-3.5 text-base text-ink"
                >
                  {category.name}
                </Link>
              ))}
            </>
          )}
        </nav>
      </div>
    </>
  )
}
