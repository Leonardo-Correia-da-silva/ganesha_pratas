import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AddressFields } from '@/components/checkout/AddressFields'
import { checkoutSchema, type CheckoutFormValues } from '@/components/checkout/checkoutSchema'
import { CheckoutSummary } from '@/components/checkout/CheckoutSummary'
import { DeliveryMethodSelector } from '@/components/checkout/DeliveryMethodSelector'
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCart } from '@/hooks/useCart'
import { useShippingCalculation } from '@/hooks/useShippingCalculation'
import { createOrder, InsufficientStockError } from '@/services/orderService'
import { getStoreSettings } from '@/services/storeSettingsService'
import { generateWhatsAppMessage, getWhatsAppUrl } from '@/services/whatsappService'
import { onlyDigits } from '@/utils/cep'
import { formatPhone } from '@/utils/phone'

export function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [orderCompleted, setOrderCompleted] = useState(false)
  const clientRequestId = useRef(crypto.randomUUID())

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      phone: '',
      deliveryMethod: 'pickup',
      paymentMethod: 'pix',
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form

  const deliveryMethod = watch('deliveryMethod')
  const paymentMethod = watch('paymentMethod')
  const zipCode = watch('zipCode')

  useEffect(() => {
    if (deliveryMethod === 'delivery' && paymentMethod === 'cash') {
      setValue('paymentMethod', 'pix')
    }
  }, [deliveryMethod, paymentMethod, setValue])
  const { result: shipping, loading: shippingLoading } = useShippingCalculation(
    zipCode,
    deliveryMethod === 'delivery',
  )

  const shippingPrice = useMemo(() => {
    if (deliveryMethod === 'pickup') return 0
    if (shipping?.status === 'ok') return shipping.price
    return null
  }, [deliveryMethod, shipping])

  const shippingPending = deliveryMethod === 'delivery' && shipping?.status === 'out-of-area'

  useEffect(() => {
    if (!orderCompleted && items.length === 0) {
      navigate('/carrinho')
    }
  }, [items, orderCompleted, navigate])

  async function onSubmit(values: CheckoutFormValues) {
    setSubmitError(null)
    setSubmitting(true)
    try {
      const order = await createOrder({
        clientRequestId: clientRequestId.current,
        customer: { name: values.name.trim(), phone: values.phone.trim() },
        deliveryMethod: values.deliveryMethod,
        paymentMethod: values.paymentMethod,
        address:
          values.deliveryMethod === 'delivery'
            ? {
                zipCode: onlyDigits(values.zipCode),
                street: values.street.trim(),
                number: values.number.trim(),
                complement: values.complement.trim(),
                neighborhood: values.neighborhood.trim(),
                city: values.city.trim(),
                state: values.state.trim(),
              }
            : null,
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      })

      setOrderCompleted(true)
      clearCart()

      const storeSettings = await getStoreSettings().catch(() => null)
      if (storeSettings?.whatsapp) {
        const message = generateWhatsAppMessage(order)
        window.open(getWhatsAppUrl(storeSettings.whatsapp, message), '_blank', 'noopener,noreferrer')
      }

      navigate(`/pedido/${order.id}`)
    } catch (error) {
      if (error instanceof InsufficientStockError) {
        setSubmitError(error.message)
      } else {
        setSubmitError('Não foi possível finalizar o pedido. Tente novamente em instantes.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = deliveryMethod === 'pickup' || shipping?.status === 'ok' || shipping?.status === 'out-of-area'

  return (
    <div className="container-luxe py-12 md:py-16">
      <h1 className="mb-8 font-display text-3xl text-ink md:text-4xl">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-10 lg:grid-cols-3 lg:gap-16">
        <div className="space-y-10 lg:col-span-2">
          <section>
            <h2 className="mb-4 text-xs uppercase tracking-widest text-neutral-500">Seus dados</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nome completo" error={errors.name?.message} {...register('name')} />
              <Input
                label="WhatsApp"
                placeholder="(19) 99999-9999"
                error={errors.phone?.message}
                {...register('phone')}
                onChange={(event) => setValue('phone', formatPhone(event.target.value))}
                inputMode="tel"
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xs uppercase tracking-widest text-neutral-500">Entrega</h2>
            <DeliveryMethodSelector value={deliveryMethod} onChange={(value) => setValue('deliveryMethod', value)} />
          </section>

          {deliveryMethod === 'delivery' && (
            <section>
              <h2 className="mb-4 text-xs uppercase tracking-widest text-neutral-500">Endereço de entrega</h2>
              <AddressFields form={form} shipping={shipping} shippingLoading={shippingLoading} />
            </section>
          )}

          <section>
            <h2 className="mb-4 text-xs uppercase tracking-widest text-neutral-500">Pagamento</h2>
            <PaymentMethodSelector
              value={paymentMethod}
              deliveryMethod={deliveryMethod}
              onChange={(value) => setValue('paymentMethod', value)}
            />
          </section>

          {submitError && (
            <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <CheckoutSummary
            items={items}
            subtotal={subtotal}
            shipping={shippingPrice}
            shippingPending={shippingPending}
          />
          <Button type="submit" className="w-full" loading={submitting} disabled={!canSubmit || submitting}>
            {submitting ? 'Processando pedido...' : 'Finalizar pedido'}
          </Button>
        </div>
      </form>
    </div>
  )
}
