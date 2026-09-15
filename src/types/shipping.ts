export type ShippingMode = 'single' | 'region'

export interface ShippingRegion {
  id: string
  name: string
  zipCodeStart: string
  zipCodeEnd: string
  price: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export type ShippingRegionInput = Omit<ShippingRegion, 'id' | 'createdAt' | 'updatedAt'>

export interface ShippingSettings {
  mode: ShippingMode
  singlePrice: number
  updatedAt: string
}

export type ShippingResult =
  | { status: 'store-pickup'; price: 0 }
  | { status: 'ok'; price: number; regionName: string | null }
  | { status: 'out-of-area' }
