import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, Search, X } from 'lucide-react'
import { CartIcon } from './CartIcon'
import { CategoriesDropdown } from './CategoriesDropdown'
import { MobileDrawer } from './MobileDrawer'
import { SearchBar } from './SearchBar'
import { useAsync } from '@/hooks/useAsync'
import { getActiveCategories } from '@/services/categoryService'
import { getStoreSettings } from '@/services/storeSettingsService'
import { cn } from '@/utils/cn'

const NAV_LINKS_BEFORE = [
  { label: 'Início', to: '/' },
  { label: 'Produtos', to: '/produtos' },
]

const NAV_LINKS_AFTER = [
  { label: 'Novidades', to: '/produtos?novidades=true' },
  { label: 'Sobre', to: '/#sobre' },
  { label: 'Contato', to: '/#contato' },
]

function isDarkColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.55
}

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { data: categories } = useAsync(() => getActiveCategories(), [])
  const { data: settings } = useAsync(() => getStoreSettings(), [])

  const headerColor = settings?.headerBackgroundColor
  const isDark = Boolean(headerColor && isDarkColor(headerColor))

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 backdrop-blur',
          headerColor ? 'border-b border-transparent' : 'border-b border-stone bg-paper/95',
        )}
        style={headerColor ? { backgroundColor: headerColor } : undefined}
      >
      <div
        className="container-luxe flex h-20 items-center justify-between"
        style={isDark ? ({ '--color-ink': '#ffffff', '--color-neutral-600': '#d4d4d4' } as React.CSSProperties) : undefined}
      >
        <div className="flex flex-1 md:hidden">
          <button
            className="p-2 text-ink"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </button>
        </div>

        <Link to="/" className="flex shrink-0 items-center font-display text-xl tracking-wide text-ink md:text-2xl">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.storeName} className="h-12 w-auto object-contain md:h-12" />
          ) : (
            (settings?.storeName ?? 'Joias Jaguariúna')
          )}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS_BEFORE.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'text-xs uppercase tracking-widest text-neutral-600 transition-colors hover:text-ink',
                  isActive && 'text-ink',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}

          <CategoriesDropdown categories={categories ?? []} />

          {NAV_LINKS_AFTER.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'text-xs uppercase tracking-widest text-neutral-600 transition-colors hover:text-ink',
                  isActive && 'text-ink',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-1 md:flex-none">
          <button
            className="hidden p-2 text-ink md:inline-flex"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label={searchOpen ? 'Fechar pesquisa' : 'Abrir pesquisa'}
          >
            {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
          </button>
          <button className="p-2 text-ink md:hidden" onClick={() => setSearchOpen(true)} aria-label="Abrir pesquisa">
            <Search className="size-5" />
          </button>
          <CartIcon />
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-stone bg-paper">
          <div className="container-luxe py-3">
            <SearchBar onClose={() => setSearchOpen(false)} />
          </div>
        </div>
      )}
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} categories={categories ?? []} />
    </>
  )
}
