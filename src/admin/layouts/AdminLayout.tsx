import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { AdminSidebar } from '@/admin/components/AdminSidebar'

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="hidden w-64 shrink-0 lg:fixed lg:inset-y-0 lg:flex">
        <AdminSidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">
            <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="flex h-14 items-center gap-3 border-b border-stone bg-paper px-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} aria-label="Abrir menu" className="p-1">
            {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <span className="font-display text-base text-ink">Painel Administrativo</span>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
