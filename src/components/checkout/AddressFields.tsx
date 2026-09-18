import { useEffect, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Loader2, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { CepInvalidError, CepNotFoundError, lookupAddressByZipCode } from '@/services/cepService'
import { formatZipCode, isValidZipCodeFormat, onlyDigits } from '@/utils/cep'
import type { CheckoutFormValues } from './checkoutSchema'
import type { ShippingResult } from '@/types'
import { formatCurrency } from '@/utils/currency'

interface AddressFieldsProps {
  form: UseFormReturn<CheckoutFormValues>
  shipping: ShippingResult | null
  shippingLoading: boolean
}

export function AddressFields({ form, shipping, shippingLoading }: AddressFieldsProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form

  const zipCode = watch('zipCode')
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)
  const [addressFound, setAddressFound] = useState(false)

  useEffect(() => {
    const digits = onlyDigits(zipCode ?? '')
    if (digits.length !== 8) {
      setAddressFound(false)
      return
    }

    let active = true
    setCepLoading(true)
    setCepError(null)

    lookupAddressByZipCode(digits)
      .then((address) => {
        if (!active) return
        setValue('street', address.street, { shouldValidate: true })
        setValue('neighborhood', address.neighborhood, { shouldValidate: true })
        setValue('city', address.city, { shouldValidate: true })
        setValue('state', address.state, { shouldValidate: true })
        setAddressFound(true)
      })
      .catch((error: unknown) => {
        if (!active) return
        setAddressFound(false)
        if (error instanceof CepNotFoundError) {
          setCepError('CEP não encontrado.')
        } else if (error instanceof CepInvalidError) {
          setCepError('CEP inválido.')
        } else {
          setCepError('Não foi possível consultar o CEP agora.')
        }
      })
      .finally(() => {
        if (active) setCepLoading(false)
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zipCode])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          label="CEP"
          placeholder="00000-000"
          error={errors.zipCode?.message ?? cepError ?? undefined}
          {...register('zipCode')}
          onChange={(event) => setValue('zipCode', formatZipCode(event.target.value))}
          inputMode="numeric"
        />
        {cepLoading && (
          <Loader2 className="absolute right-3 top-9 size-4 animate-spin text-neutral-400" aria-hidden />
        )}
      </div>

      {addressFound && !cepLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input label="Rua" error={errors.street?.message} {...register('street')} readOnly />
          </div>
          <Input label="Número" placeholder="123" error={errors.number?.message} {...register('number')} />
          <Input label="Complemento" placeholder="Apto, bloco..." {...register('complement')} />
          <Input label="Bairro" error={errors.neighborhood?.message} {...register('neighborhood')} readOnly />
          <div className="flex gap-4">
            <Input label="Cidade" error={errors.city?.message} {...register('city')} readOnly className="flex-1" />
            <Input label="UF" error={errors.state?.message} {...register('state')} readOnly className="w-20" />
          </div>
        </div>
      )}

      {isValidZipCodeFormat(zipCode ?? '') && !cepLoading && !cepError && (
        <div className="flex items-center gap-2 border border-stone bg-offwhite px-4 py-3 text-sm">
          <MapPin className="size-4 shrink-0 text-gold" />
          {shippingLoading ? (
            <span className="text-neutral-500">Calculando frete...</span>
          ) : shipping?.status === 'ok' ? (
            <span className="text-ink">
              Frete para {shipping.regionName ?? 'sua região'}: {formatCurrency(shipping.price)}
            </span>
          ) : shipping?.status === 'out-of-area' ? (
            <span className="text-ink">
              Ainda não temos um valor de frete pra essa região — vamos combinar pelo WhatsApp após o pedido.
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}
