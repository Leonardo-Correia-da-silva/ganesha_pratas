import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, Search, X } from 'lucide-react'
import { CartIcon } from './CartIcon'
import { CategoriesDropdown } from './CategoriesDropdown'
import { MobileDrawer } from './MobileDrawer'
import { SearchBar } from './SearchBar'
import { useAsync } from '@/hooks/useAsync'
import { getActiveCategories } from '@/services/categoryService'
import { cn } from '@/utils/cn'

const NAV_LINKS_BEFORE = [
  { label: 'Início', to: '/' },
  { label: 'Joias', to: '/produtos' },
]

const NAV_LINKS_AFTER = [
  { label: 'Novidades', to: '/produtos?novidades=true' },
  { label: 'Sobre', to: '/#sobre' },
  { label: 'Contato', to: '/#contato' },
]

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { data: categories } = useAsync(() => getActiveCategories(), [])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-stone bg-paper/95 backdrop-blur">
      <div className="container-luxe flex h-16 items-center justify-between md:h-20">
        <button
          className="p-2 md:hidden"
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </button>

        <Link to="/" className="font-display text-xl tracking-wide text-ink md:text-2xl">
          Joias Jaguariúna
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

        <div className="flex items-center gap-1">
          <button
            className="hidden p-2 md:inline-flex"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label={searchOpen ? 'Fechar pesquisa' : 'Abrir pesquisa'}
          >
            {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
          </button>
          <button className="p-2 md:hidden" onClick={() => setSearchOpen(true)} aria-label="Abrir pesquisa">
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
