export interface Facility {
  id: string
  name: string
  address: string
  lga: string
  state: string
  phone?: string | null
  latitude?: number | null
  longitude?: number | null
  google_place_id?: string | null
  google_maps_url?: string | null
  services: string[]
  verified: boolean
  created_at?: string
  updated_at?: string
}
