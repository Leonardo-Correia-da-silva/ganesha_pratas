import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { checkSession, login as loginRequest, logout as logoutRequest } from '@/admin/services/authService'

interface AdminAuthContextValue {
  authenticated: boolean
  checking: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    checkSession()
      .then(setAuthenticated)
      .catch(() => setAuthenticated(false))
      .finally(() => setChecking(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await loginRequest(email, password)
    setAuthenticated(true)
  }, [])

  const logout = useCallback(async () => {
    await logoutRequest()
    setAuthenticated(false)
  }, [])

  const value = useMemo(() => ({ authenticated, checking, login, logout }), [authenticated, checking, login, logout])

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
