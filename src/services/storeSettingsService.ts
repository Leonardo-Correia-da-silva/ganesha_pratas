import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { StoreSettings } from '@/types'

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Joias Jaguariúna',
  logoUrl: null,
  footerLogoUrl: null,
  footerBackgroundUrl: null,
  heroEyebrow: null,
  heroTitle: null,
  heroSubtitle: null,
  heroImageUrl: null,
  heroVideoUrls: [],
  aboutTitle: null,
  aboutText: null,
  aboutImageUrl: null,
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

  const data = snapshot.data() as Partial<StoreSettings> & { heroVideoUrl?: string | null }
  const merged = { ...DEFAULT_SETTINGS, ...data }

  // Migrate the old single-video field for stores that saved a hero video before
  // the multi-video playlist feature existed. Only migrate when heroVideoUrls was never
  // saved at all — once the admin explicitly saves an empty list, that must stick, even
  // if a (now-deleted-on-save) legacy field briefly lingered in the same document.
  if (!Array.isArray(data.heroVideoUrls) && data.heroVideoUrl) {
    merged.heroVideoUrls = [data.heroVideoUrl]
  }

  return merged
}
