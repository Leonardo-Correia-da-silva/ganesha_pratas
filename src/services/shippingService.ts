import { doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { collectionRef, withId } from '@/firebase/firestore'
import { isValidZipCodeFormat, zipCodeToNumber } from '@/utils/cep'
import type { ShippingRegion, ShippingResult, ShippingSettings } from '@/types'

const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  mode: 'single',
  singlePrice: 15,
  updatedAt: new Date().toISOString(),
}

export async function getShippingSettings(): Promise<ShippingSettings> {
  const snapshot = await getDoc(doc(db, 'settings', 'shipping'))
  if (!snapshot.exists()) return DEFAULT_SHIPPING_SETTINGS
  return { ...DEFAULT_SHIPPING_SETTINGS, ...(snapshot.data() as Partial<ShippingSettings>) }
}

export async function getActiveShippingRegions(): Promise<ShippingRegion[]> {
  const q = query(collectionRef('shippingRegions'), where('active', '==', true))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => withId<ShippingRegion>(d))
}

function findRegionForZipCode(zipCode: string, regions: ShippingRegion[]): ShippingRegion | null {
  const target = zipCodeToNumber(zipCode)
  return (
    regions.find((region) => {
      const start = zipCodeToNumber(region.zipCodeStart)
      const end = zipCodeToNumber(region.zipCodeEnd)
      return target >= start && target <= end
    }) ?? null
  )
}

export async function calculateShipping(zipCode: string): Promise<ShippingResult> {
  if (!isValidZipCodeFormat(zipCode)) {
    return { status: 'out-of-area' }
  }

  const settings = await getShippingSettings()

  if (settings.mode === 'single') {
    return { status: 'ok', price: settings.singlePrice, regionName: null }
  }

  const regions = await getActiveShippingRegions()
  const region = findRegionForZipCode(zipCode, regions)

  if (!region) {
    return { status: 'out-of-area' }
  }

  return { status: 'ok', price: region.price, regionName: region.name }
}
