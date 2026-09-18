import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAdminAuth } from '@/admin/hooks/useAdminAuth'
import { AdminApiError } from '@/admin/services/adminApi'
import { useAsync } from '@/hooks/useAsync'
import { getStoreSettings } from '@/services/storeSettingsService'

const loginSchema = z.object({
  email: z.string().email('Informe um email válido.'),
  password: z.string().min(1, 'Informe sua senha.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function Login() {
  const { authenticated, checking, login } = useAdminAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const expired = searchParams.get('expired') === '1'
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { data: settings } = useAsync(() => getStoreSettings(), [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  if (!checking && authenticated) {
    return <Navigate to="/admin/dashboard" replace />
  }

  async function onSubmit(values: LoginFormValues) {
    setServerError(null)
    setSubmitting(true)
    try {
      await login(values.email, values.password)
      navigate('/admin/dashboard')
    } catch (error) {
      setServerError(error instanceof AdminApiError ? error.message : 'Não foi possível entrar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-offwhite px-4">
      <div className="w-full max-w-sm border border-stone bg-paper p-8">
        <p className="text-center font-display text-2xl text-ink">{settings?.storeName ?? 'Joias Jaguariúna'}</p>
        <p className="mt-1 text-center text-xs uppercase tracking-widest text-neutral-500">
          Painel administrativo
        </p>

        {expired && (
          <p className="mt-6 border border-gold-light bg-gold-light/40 px-4 py-3 text-center text-sm text-ink">
            Sua sessão expirou. Faça login novamente.
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <Input label="Email" type="email" autoComplete="username" error={errors.email?.message} {...register('email')} />
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          {serverError && (
            <p role="alert" className="text-sm text-red-600">
              {serverError}
            </p>
          )}

          <Button type="submit" variant="secondary" className="w-full" loading={submitting}>
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}
