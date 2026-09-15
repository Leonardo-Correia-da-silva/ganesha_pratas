import { useEffect, useState } from 'react'
import { calculateShipping } from '@/services/shippingService'
import { isValidZipCodeFormat } from '@/utils/cep'
import type { ShippingResult } from '@/types'

export function useShippingCalculation(zipCode: string, enabled: boolean) {
  const [result, setResult] = useState<ShippingResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled || !isValidZipCodeFormat(zipCode)) {
      setResult(null)
      return
    }

    let active = true
    setLoading(true)

    calculateShipping(zipCode)
      .then((shippingResult) => {
        if (active) setResult(shippingResult)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [zipCode, enabled])

  return { result, loading }
}
