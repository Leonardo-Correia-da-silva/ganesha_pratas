import { useContext } from 'react'
import { AdminAuthContext } from '@/admin/context/AdminAuthContext'

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth deve ser utilizado dentro de um AdminAuthProvider.')
  }
  return context
}
