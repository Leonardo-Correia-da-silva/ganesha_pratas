import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { slugify } from '@/utils/slug'
import type { Category, CategoryInput } from '@/types'

const schema = z.object({
  name: z.string().trim().min(2, 'Nome é obrigatório.'),
  slug: z.string().trim().min(2, 'Slug é obrigatório.'),
  description: z.string(),
  imageUrl: z.string(),
  active: z.boolean(),
  order: z.number().int().min(0),
})

type FormValues = z.infer<typeof schema>

interface CategoryFormModalProps {
  category: Category | null
  saving: boolean
  onSave: (input: CategoryInput) => void
  onClose: () => void
}

export function CategoryFormModal({ category, saving, onSave, onClose }: CategoryFormModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category?.name ?? '',
      slug: category?.slug ?? '',
      description: category?.description ?? '',
      imageUrl: category?.imageUrl ?? '',
      active: category?.active ?? true,
      order: category?.order ?? 0,
    },
  })

  const name = watch('name')

  useEffect(() => {
    if (!category) setValue('slug', slugify(name))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  function onSubmit(values: FormValues) {
    onSave({
      name: values.name.trim(),
      slug: slugify(values.slug),
      description: values.description?.trim() ?? '',
      imageUrl: values.imageUrl?.trim() || null,
      active: values.active,
      order: values.order,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-paper p-6">
        <h2 className="font-display text-lg text-ink">{category ? 'Editar categoria' : 'Nova categoria'}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Nome" error={errors.name?.message} {...register('name')} />
          <Input label="Slug" hint="Usado na URL /categoria/slug" error={errors.slug?.message} {...register('slug')} />
          <Input label="Descrição" {...register('description')} />
          <Input label="URL da imagem" placeholder="https://..." {...register('imageUrl')} />
          <Input
            label="Ordem de exibição"
            type="number"
            error={errors.order?.message}
            {...register('order', { valueAsNumber: true })}
          />

          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" {...register('active')} className="size-4 accent-ink" />
            Categoria ativa
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
