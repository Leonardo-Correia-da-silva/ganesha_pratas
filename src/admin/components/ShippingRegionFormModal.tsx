import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatZipCode, onlyDigits } from '@/utils/cep'
import type { ShippingRegion, ShippingRegionInput } from '@/types'

const schema = z
  .object({
    name: z.string().trim().min(2, 'Nome é obrigatório.'),
    zipCodeStart: z.string().refine((v) => onlyDigits(v).length === 8, 'CEP inicial inválido.'),
    zipCodeEnd: z.string().refine((v) => onlyDigits(v).length === 8, 'CEP final inválido.'),
    price: z.number().min(0, 'Valor não pode ser negativo.'),
    active: z.boolean(),
  })
  .refine((data) => onlyDigits(data.zipCodeStart) <= onlyDigits(data.zipCodeEnd), {
    message: 'O CEP inicial deve ser menor ou igual ao CEP final.',
    path: ['zipCodeEnd'],
  })

type FormValues = z.infer<typeof schema>

interface ShippingRegionFormModalProps {
  region: ShippingRegion | null
  saving: boolean
  onSave: (input: ShippingRegionInput) => void
  onClose: () => void
}

export function ShippingRegionFormModal({ region, saving, onSave, onClose }: ShippingRegionFormModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: region?.name ?? '',
      zipCodeStart: region ? formatZipCode(region.zipCodeStart) : '',
      zipCodeEnd: region ? formatZipCode(region.zipCodeEnd) : '',
      price: region?.price ?? 0,
      active: region?.active ?? true,
    },
  })

  function onSubmit(values: FormValues) {
    onSave({
      name: values.name.trim(),
      zipCodeStart: onlyDigits(values.zipCodeStart),
      zipCodeEnd: onlyDigits(values.zipCodeEnd),
      price: Number(values.price),
      active: values.active,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-paper p-6">
        <h2 className="font-display text-lg text-ink">{region ? 'Editar região' : 'Nova região'}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Nome da região" placeholder="Ex: Jaguariúna" error={errors.name?.message} {...register('name')} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="CEP inicial"
              placeholder="00000-000"
              error={errors.zipCodeStart?.message}
              {...register('zipCodeStart')}
              onChange={(e) => setValue('zipCodeStart', formatZipCode(e.target.value))}
            />
            <Input
              label="CEP final"
              placeholder="00000-000"
              error={errors.zipCodeEnd?.message}
              {...register('zipCodeEnd')}
              onChange={(e) => setValue('zipCodeEnd', formatZipCode(e.target.value))}
            />
          </div>

          <Input
            label="Valor do frete (R$)"
            type="number"
            step="0.01"
            min="0"
            error={errors.price?.message}
            {...register('price', { valueAsNumber: true })}
          />

          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" {...register('active')} className="size-4 accent-ink" />
            Região ativa
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
