import { NavLink } from 'react-router-dom'
import { LayoutDashboard, LogOut, Package, Settings, ShoppingCart, Tags, Truck } from 'lucide-react'
import { useAdminAuth } from '@/admin/hooks/useAdminAuth'
import { useAsync } from '@/hooks/useAsync'
import { getStoreSettings } from '@/services/storeSettingsService'
import { cn } from '@/utils/cn'

const LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Produtos', icon: Package },
  { to: '/admin/categories', label: 'Categorias', icon: Tags },
  { to: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
  { to: '/admin/settings/shipping', label: 'Frete', icon: Truck },
  { to: '/admin/settings', label: 'Configurações', icon: Settings, end: true },
]

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { logout } = useAdminAuth()
  const { data: settings } = useAsync(() => getStoreSettings(), [])

  return (
    <div className="flex h-full flex-col bg-ink text-offwhite">
      <div className="px-6 py-6">
        <p className="font-display text-lg text-paper">Painel Administrativo</p>
        <p className="text-xs text-neutral-400">{settings?.storeName ?? 'Joias Jaguariúna'}</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                isActive ? 'bg-gold-soft text-ink' : 'text-neutral-300 hover:bg-paper/5 hover:text-paper',
              )
            }
          >
            <Icon className="size-4" strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-6">
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-neutral-300 transition-colors hover:bg-paper/5 hover:text-paper"
        >
          <LogOut className="size-4" strokeWidth={1.5} />
          Sair
        </button>
      </div>
    </div>
  )
}
