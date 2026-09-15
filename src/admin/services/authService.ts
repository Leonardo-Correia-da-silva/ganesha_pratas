import { adminApi } from './adminApi'

export async function login(email: string, password: string): Promise<void> {
  await adminApi.post('/api/auth/login', { email, password })
}

export async function logout(): Promise<void> {
  await adminApi.post('/api/auth/logout')
}

export async function checkSession(): Promise<boolean> {
  const data = await adminApi.get<{ authenticated: boolean }>('/api/auth/session')
  return data.authenticated
}
