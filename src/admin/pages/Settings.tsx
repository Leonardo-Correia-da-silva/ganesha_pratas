import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PageHeader } from '@/admin/components/PageHeader'
import { AdminApiError } from '@/admin/services/adminApi'
import { getAdminStoreSettings, updateStoreSettings } from '@/admin/services/settingsAdminService'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'

const schema = z.object({
  storeName: z.string().trim().min(1, 'Nome da loja é obrigatório.'),
  logoUrl: z.string(),
  whatsapp: z.string().trim().min(8, 'Informe um WhatsApp válido.'),
  instagram: z.string(),
  email: z.string(),
  address: z.string(),
  city: z.string().trim().min(1, 'Cidade é obrigatória.'),
  state: z.string().trim().length(2, 'UF deve ter 2 letras.'),
  zipCode: z.string(),
})

type FormValues = z.infer<typeof schema>

export function Settings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      storeName: 'Joias Jaguariúna',
      logoUrl: '',
      whatsapp: '',
      instagram: '',
      email: '',
      address: '',
      city: 'Jaguariúna',
      state: 'SP',
      zipCode: '',
    },
  })

  useEffect(() => {
    getAdminStoreSettings()
      .then((settings) => {
        if (settings) {
          reset({
            storeName: settings.storeName,
            logoUrl: settings.logoUrl ?? '',
            whatsapp: settings.whatsapp,
            instagram: settings.instagram,
            email: settings.email,
            address: settings.address,
            city: settings.city,
            state: settings.state,
            zipCode: settings.zipCode,
          })
        }
      })
      .finally(() => setLoading(false))
  }, [reset])

  async function onSubmit(values: FormValues) {
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      await updateStoreSettings({ ...values, logoUrl: values.logoUrl || null })
      setMessage('Configurações salvas com sucesso.')
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Não foi possível salvar as configurações.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Configurações da loja" />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
        <Input label="Nome da loja" error={errors.storeName?.message} {...register('storeName')} />
        <Input label="URL do logo" placeholder="https://..." {...register('logoUrl')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="WhatsApp"
            placeholder="19999999999"
            hint="Com DDI e DDD, apenas números"
            error={errors.whatsapp?.message}
            {...register('whatsapp')}
          />
          <Input label="Instagram" placeholder="@sualoja" {...register('instagram')} />
        </div>
        <Input label="Email" type="email" {...register('email')} />
        <Input label="Endereço" {...register('address')} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Cidade" error={errors.city?.message} {...register('city')} />
          <Input label="Estado (UF)" maxLength={2} error={errors.state?.message} {...register('state')} />
          <Input label="CEP da loja" {...register('zipCode')} />
        </div>

        {message && <p className="text-sm text-green-700">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" loading={saving}>
          Salvar configurações
        </Button>
      </form>
    </div>
  )
}
