import type { Firestore } from 'firebase-admin/firestore'

export type ServerShippingResult =
  | { status: 'ok'; price: number; regionName: string | null }
  | { status: 'out-of-area' }

function zipCodeToNumber(zipCode: string): number {
  return Number.parseInt(zipCode, 10)
}

export async function calculateShippingServer(db: Firestore, zipCodeDigits: string): Promise<ServerShippingResult> {
  const settingsSnapshot = await db.collection('settings').doc('shipping').get()
  const settings = settingsSnapshot.exists
    ? (settingsSnapshot.data() as { mode: 'single' | 'region'; singlePrice: number })
    : { mode: 'single' as const, singlePrice: 15 }

  if (settings.mode === 'single') {
    return { status: 'ok', price: settings.singlePrice, regionName: null }
  }

  const regionsSnapshot = await db.collection('shippingRegions').where('active', '==', true).get()
  const target = zipCodeToNumber(zipCodeDigits)

  for (const doc of regionsSnapshot.docs) {
    const region = doc.data() as { name: string; zipCodeStart: string; zipCodeEnd: string; price: number }
    const start = zipCodeToNumber(region.zipCodeStart)
    const end = zipCodeToNumber(region.zipCodeEnd)
    if (target >= start && target <= end) {
      return { status: 'ok', price: region.price, regionName: region.name }
    }
  }

  return { status: 'out-of-area' }
}
