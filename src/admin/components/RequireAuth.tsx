import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '@/components/ui/Spinner'
import { useAdminAuth } from '@/admin/hooks/useAdminAuth'

export function RequireAuth() {
  const { authenticated, checking } = useAdminAuth()

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-offwhite">
        <Spinner />
      </div>
    )
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
