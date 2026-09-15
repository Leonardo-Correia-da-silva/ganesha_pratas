import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { StoreSettings } from '@/types'

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Joias Jaguariúna',
  logoUrl: null,
  whatsapp: import.meta.env.VITE_OWNER_WHATSAPP ?? '',
  instagram: '',
  email: '',
  address: '',
  city: 'Jaguariúna',
  state: 'SP',
  zipCode: '',
  updatedAt: new Date().toISOString(),
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const snapshot = await getDoc(doc(db, 'settings', 'store'))
  if (!snapshot.exists()) return DEFAULT_SETTINGS
  return { ...DEFAULT_SETTINGS, ...(snapshot.data() as Partial<StoreSettings>) }
}
