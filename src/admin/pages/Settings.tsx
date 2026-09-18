import { useEffect, useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PageHeader } from '@/admin/components/PageHeader'
import { ImageUrlField } from '@/admin/components/ImageUrlField'
import { VideoListField } from '@/admin/components/VideoListField'
import { AdminApiError } from '@/admin/services/adminApi'
import { getAdminStoreSettings, updateStoreSettings } from '@/admin/services/settingsAdminService'
import {
  uploadAboutImage,
  uploadFooterBackground,
  uploadFooterLogo,
  uploadHeroImage,
  uploadHeroVideo,
  uploadLogo,
} from '@/admin/services/uploadService'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'

const schema = z.object({
  storeName: z.string().trim().min(1, 'Nome da loja é obrigatório.'),
  logoUrl: z.string(),
  headerBackgroundColor: z.string(),
  footerLogoUrl: z.string(),
  footerBackgroundUrl: z.string(),
  heroEyebrow: z.string(),
  heroTitle: z.string(),
  heroSubtitle: z.string(),
  heroSubtitleEnabled: z.boolean(),
  heroImageUrl: z.string(),
  aboutTitle: z.string(),
  aboutText: z.string(),
  aboutImageUrl: z.string(),
  whatsapp: z.string().trim().min(8, 'Informe um WhatsApp válido.'),
  instagram: z.string(),
  email: z.string(),
  address: z.string(),
  city: z.string().trim().min(1, 'Cidade é obrigatória.'),
  state: z.string().trim().length(2, 'UF deve ter 2 letras.'),
  zipCode: z.string(),
})

type FormValues = z.infer<typeof schema>

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="border border-stone bg-paper p-5">
      <h2 className="font-display text-lg text-ink">{title}</h2>
      {description && <p className="mt-1 text-xs text-neutral-500">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

export function Settings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [heroVideoUrls, setHeroVideoUrls] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      storeName: 'Joias Jaguariúna',
      logoUrl: '',
      headerBackgroundColor: '',
      footerLogoUrl: '',
      footerBackgroundUrl: '',
      heroEyebrow: '',
      heroTitle: '',
      heroSubtitle: '',
      heroSubtitleEnabled: true,
      heroImageUrl: '',
      aboutTitle: '',
      aboutText: '',
      aboutImageUrl: '',
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
            headerBackgroundColor: settings.headerBackgroundColor ?? '',
            footerLogoUrl: settings.footerLogoUrl ?? '',
            footerBackgroundUrl: settings.footerBackgroundUrl ?? '',
            heroEyebrow: settings.heroEyebrow ?? '',
            heroTitle: settings.heroTitle ?? '',
            heroSubtitle: settings.heroSubtitle ?? '',
            heroSubtitleEnabled: settings.heroSubtitleEnabled ?? true,
            heroImageUrl: settings.heroImageUrl ?? '',
            aboutTitle: settings.aboutTitle ?? '',
            aboutText: settings.aboutText ?? '',
            aboutImageUrl: settings.aboutImageUrl ?? '',
            whatsapp: settings.whatsapp,
            instagram: settings.instagram,
            email: settings.email,
            address: settings.address,
            city: settings.city,
            state: settings.state,
            zipCode: settings.zipCode,
          })
          setHeroVideoUrls(settings.heroVideoUrls ?? [])
        }
      })
      .finally(() => setLoading(false))
  }, [reset])

  const logoUrl = watch('logoUrl')
  const headerBackgroundColor = watch('headerBackgroundColor')
  const footerLogoUrl = watch('footerLogoUrl')
  const footerBackgroundUrl = watch('footerBackgroundUrl')
  const heroImageUrl = watch('heroImageUrl')
  const aboutImageUrl = watch('aboutImageUrl')

  async function onSubmit(values: FormValues) {
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      await updateStoreSettings({
        ...values,
        logoUrl: values.logoUrl || null,
        headerBackgroundColor: values.headerBackgroundColor || null,
        footerLogoUrl: values.footerLogoUrl || null,
        footerBackgroundUrl: values.footerBackgroundUrl || null,
        heroEyebrow: values.heroEyebrow || null,
        heroTitle: values.heroTitle || null,
        heroSubtitle: values.heroSubtitle || null,
        heroSubtitleEnabled: values.heroSubtitleEnabled,
        heroImageUrl: values.heroImageUrl || null,
        heroVideoUrls,
        aboutTitle: values.aboutTitle || null,
        aboutText: values.aboutText || null,
        aboutImageUrl: values.aboutImageUrl || null,
      })
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

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <SettingsSection title="Identidade da loja" description="Nome e logos usados no cabeçalho e no rodapé do site.">
          <Input label="Nome da loja" error={errors.storeName?.message} {...register('storeName')} />

          <ImageUrlField
            label="Logo do cabeçalho"
            value={logoUrl}
            onValueChange={(url) => setValue('logoUrl', url, { shouldDirty: true })}
            onUpload={uploadLogo}
            inputProps={register('logoUrl')}
            previewClassName="h-14 w-14 shrink-0 border border-stone object-contain"
            hint="JPG, PNG ou WEBP · até 3MB — ou cole o link de uma imagem já hospedada."
          />

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-neutral-600">Cor do cabeçalho</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={headerBackgroundColor || '#ffffff'}
                onChange={(e) => setValue('headerBackgroundColor', e.target.value, { shouldDirty: true })}
                className="h-10 w-14 cursor-pointer border border-stone bg-paper p-1"
              />
              {headerBackgroundColor && (
                <button
                  type="button"
                  onClick={() => setValue('headerBackgroundColor', '', { shouldDirty: true })}
                  className="text-xs uppercase tracking-wide text-neutral-500 underline hover:text-ink"
                >
                  Restaurar padrão
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Se sua logo for clara, escolha um cabeçalho escuro para ela ficar visível (e vice-versa). O texto do menu
              se ajusta automaticamente para continuar legível.
            </p>
          </div>

          <ImageUrlField
            label="Logo do rodapé"
            value={footerLogoUrl}
            onValueChange={(url) => setValue('footerLogoUrl', url, { shouldDirty: true })}
            onUpload={uploadFooterLogo}
            inputProps={register('footerLogoUrl')}
            previewClassName="h-14 w-14 shrink-0 border border-stone bg-ink object-contain"
            hint="Como o fundo do rodapé é escuro, use uma versão clara da logo. Se deixar em branco, usa a mesma logo do cabeçalho."
          />
        </SettingsSection>

        <SettingsSection
          title="Capa da página inicial"
          description="Textos, foto ou vídeo em destaque no topo do site (a primeira coisa que o visitante vê)."
        >
          <Input
            label="Etiqueta"
            placeholder="Ex: Joalheria em Jaguariúna"
            hint="Texto pequeno acima do título. Se deixar em branco, o site mostra um aviso pedindo pra preencher."
            {...register('heroEyebrow')}
          />
          <Input
            label="Título"
            placeholder="Ex: Elegância que permanece."
            hint="Se deixar em branco, o site mostra um aviso pedindo pra preencher."
            {...register('heroTitle')}
          />
          <div>
            <Input
              label="Parágrafo"
              placeholder="Ex: Joias escolhidas para transformar momentos em memórias."
              hint="Se deixar em branco, o site mostra um aviso pedindo pra preencher — a menos que você desative abaixo."
              {...register('heroSubtitle')}
            />
            <label className="mt-2 flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" {...register('heroSubtitleEnabled')} className="size-4 accent-ink" />
              Exibir parágrafo na capa
            </label>
          </div>

          <ImageUrlField
            label="Foto de fundo"
            value={heroImageUrl}
            onValueChange={(url) => setValue('heroImageUrl', url, { shouldDirty: true })}
            onUpload={uploadHeroImage}
            inputProps={register('heroImageUrl')}
            previewClassName="h-14 w-24 shrink-0 border border-stone object-cover"
            hint="JPG, PNG ou WEBP · até 3MB — ou cole o link de uma imagem já hospedada. Se deixar em branco, a foto padrão continua sendo usada."
          />

          <VideoListField
            label="Vídeos de fundo (opcional)"
            value={heroVideoUrls}
            onChange={setHeroVideoUrls}
            onUpload={uploadHeroVideo}
            hint="MP4, WEBM ou MOV, sem limite de tamanho. Quando tiver mais de um, eles tocam em sequência (um acaba, o próximo começa). Quando algum vídeo estiver na lista, ele substitui a foto de fundo. Prefira vídeos curtos e leves para não deixar o site lento."
          />
        </SettingsSection>

        <SettingsSection
          title='Seção "Nossa história"'
          description="Bloco na página inicial contando a história da loja."
        >
          <Input
            label="Título"
            placeholder="Ex: Uma joalheria feita para durar gerações."
            hint="Se deixar em branco, o site mostra um aviso pedindo pra preencher."
            {...register('aboutTitle')}
          />

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-neutral-600">Descrição</label>
            <textarea
              rows={4}
              placeholder="Conte a história da loja para seus clientes..."
              className="w-full border border-stone bg-paper px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none"
              {...register('aboutText')}
            />
            <p className="mt-1 text-xs text-neutral-500">
              Se deixar em branco, o site vai mostrar um aviso pedindo pra preencher esse texto.
            </p>
          </div>

          <ImageUrlField
            label="Foto"
            value={aboutImageUrl}
            onValueChange={(url) => setValue('aboutImageUrl', url, { shouldDirty: true })}
            onUpload={uploadAboutImage}
            inputProps={register('aboutImageUrl')}
            previewClassName="h-14 w-24 shrink-0 border border-stone object-cover"
            hint="JPG, PNG ou WEBP · até 3MB — ou cole o link de uma imagem já hospedada. Se deixar em branco, a foto padrão continua sendo usada."
          />
        </SettingsSection>

        <SettingsSection title="Rodapé" description="Imagem de fundo exibida atrás do rodapé, no final do site.">
          <ImageUrlField
            label="Foto de fundo"
            value={footerBackgroundUrl}
            onValueChange={(url) => setValue('footerBackgroundUrl', url, { shouldDirty: true })}
            onUpload={uploadFooterBackground}
            inputProps={register('footerBackgroundUrl')}
            previewClassName="h-14 w-24 shrink-0 border border-stone object-cover"
            hint="JPG, PNG ou WEBP · até 3MB — ou cole o link de uma imagem já hospedada. Fica com uma camada escura por cima para manter o texto legível. Se deixar em branco, o rodapé continua com fundo escuro liso."
          />
        </SettingsSection>

        <SettingsSection title="Contato" description="Como os clientes podem falar com a loja.">
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
        </SettingsSection>

        <SettingsSection title="Endereço" description="Localização da loja, usada na página e no cálculo de frete local.">
          <Input label="Endereço" {...register('address')} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Cidade" error={errors.city?.message} {...register('city')} />
            <Input label="Estado (UF)" maxLength={2} error={errors.state?.message} {...register('state')} />
            <Input label="CEP da loja" {...register('zipCode')} />
          </div>
        </SettingsSection>

        {message && <p className="text-sm text-green-700">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" loading={saving}>
          Salvar configurações
        </Button>
      </form>
    </div>
  )
}
