import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PageHeader } from '@/admin/components/PageHeader'
import { ImageUploader } from '@/admin/components/ImageUploader'
import { VideoUrlField } from '@/admin/components/VideoUrlField'
import { AdminApiError } from '@/admin/services/adminApi'
import { listAllCategories } from '@/admin/services/categoryAdminService'
import { createProduct, updateProduct } from '@/admin/services/productAdminService'
import { adminApi } from '@/admin/services/adminApi'
import { uploadProductVideo } from '@/admin/services/uploadService'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { slugify } from '@/utils/slug'
import type { Category, Product, ProductImage } from '@/types'

const schema = z.object({
  name: z.string().trim().min(2, 'Nome é obrigatório.'),
  slug: z.string().trim().min(2, 'Slug é obrigatório.'),
  description: z.string().trim().min(1, 'Descrição é obrigatória.'),
  categoryId: z.string().min(1, 'Selecione uma categoria.'),
  price: z.number().positive('Preço deve ser maior que zero.'),
  promotionalPrice: z.string(),
  stock: z.number().int().min(0, 'Estoque não pode ser negativo.'),
  videoUrl: z.string(),
  featured: z.boolean(),
  isNew: z.boolean(),
  active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function ProductForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const storageProductId = useRef(id ?? crypto.randomUUID())

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      categoryId: '',
      price: 0,
      promotionalPrice: '',
      stock: 0,
      videoUrl: '',
      featured: false,
      isNew: false,
      active: true,
    },
  })

  const name = watch('name')
  const videoUrl = watch('videoUrl')

  useEffect(() => {
    if (!isEditing) setValue('slug', slugify(name))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  useEffect(() => {
    async function load() {
      const categoryList = await listAllCategories()
      setCategories(categoryList)

      if (isEditing && id) {
        const { products } = await adminApi.get<{ products: Product[] }>('/api/admin/products')
        const found = products.find((p) => p.id === id)
        if (found) {
          reset({
            name: found.name,
            slug: found.slug,
            description: found.description,
            categoryId: found.categoryId,
            price: found.price,
            promotionalPrice: found.promotionalPrice != null ? String(found.promotionalPrice) : '',
            stock: found.stock,
            videoUrl: found.videoUrl ?? '',
            featured: found.featured,
            isNew: found.isNew,
            active: found.active,
          })
          setImages(found.images)
        }
      }

      setLoading(false)
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(values: FormValues) {
    setSaving(true)
    setServerError(null)

    const input = {
      name: values.name.trim(),
      slug: slugify(values.slug),
      description: values.description.trim(),
      categoryId: values.categoryId,
      price: Number(values.price),
      promotionalPrice: values.promotionalPrice ? Number(values.promotionalPrice) : null,
      stock: Number(values.stock),
      images,
      videoUrl: values.videoUrl?.trim() || null,
      featured: values.featured,
      isNew: values.isNew,
      active: values.active,
    }

    try {
      if (isEditing && id) {
        await updateProduct(id, input)
      } else {
        await createProduct(input)
      }
      navigate('/admin/products')
    } catch (err) {
      setServerError(err instanceof AdminApiError ? err.message : 'Não foi possível salvar o produto.')
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
      <PageHeader title={isEditing ? 'Editar produto' : 'Novo produto'} />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-8">
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome" error={errors.name?.message} {...register('name')} />
            <Input label="Slug" hint="Usado na URL /produto/slug" error={errors.slug?.message} {...register('slug')} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-neutral-600">Descrição</label>
            <textarea
              rows={5}
              className="w-full border border-stone bg-paper px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none"
              {...register('description')}
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>

          <Select label="Categoria" error={errors.categoryId?.message} {...register('categoryId')}>
            <option value="">Selecione...</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Preço (R$)"
            type="number"
            step="0.01"
            min="0"
            error={errors.price?.message}
            {...register('price', { valueAsNumber: true })}
          />
          <Input
            label="Preço promocional (R$)"
            type="number"
            step="0.01"
            min="0"
            hint="Deixe em branco se não houver"
            error={errors.promotionalPrice?.message}
            {...register('promotionalPrice')}
          />
          <Input
            label="Estoque"
            type="number"
            min="0"
            error={errors.stock?.message}
            {...register('stock', { valueAsNumber: true })}
          />
        </section>

        <section>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-neutral-600">Fotos</label>
          <ImageUploader productId={storageProductId.current} images={images} onChange={setImages} />
        </section>

        <section>
          <VideoUrlField
            label="Vídeo (opcional)"
            value={videoUrl}
            onValueChange={(url) => setValue('videoUrl', url, { shouldDirty: true })}
            onUpload={(file) => uploadProductVideo(storageProductId.current, file)}
            inputProps={register('videoUrl')}
            hint="MP4, WEBM ou MOV · até 20MB — ou cole o link de um vídeo já hospedado."
          />
        </section>

        <section className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" className="size-4 accent-ink" {...register('featured')} />
            Produto em destaque
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" className="size-4 accent-ink" {...register('isNew')} />
            Produto novo
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" className="size-4 accent-ink" {...register('active')} />
            Ativo
          </label>
        </section>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <div className="flex gap-3">
          <Button type="submit" loading={saving}>
            Salvar produto
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/products')} disabled={saving}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
