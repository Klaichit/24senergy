export type ProductCategory = 'bess' | 'solar' | 'ev' | 'ems'
export type QuoteStatus = 'new' | 'contacted' | 'quoted' | 'closed'

export interface Product {
  id: string
  slug: string
  name_th: string
  name_en: string
  category: ProductCategory
  description_th: string
  description_en: string
  specs: Record<string, string>
  images: string[]
  pdf_url: string | null
  is_published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Quote {
  id: string
  name: string
  company: string
  phone: string
  email: string
  line_id: string | null
  contact_pref: string
  products: string[]
  business_type: string
  power_demand: string | null
  timeline: string | null
  budget: string | null
  details: string | null
  status: QuoteStatus
  created_at: string
}

export interface Project {
  id: string
  title_th: string
  title_en: string
  location_th: string
  location_en: string
  year: number | null
  category: string
  capacity_value: number | null
  capacity_unit: string
  capacity_detail: string
  description_th: string
  description_en: string
  image_url: string | null
  product_tag: string
  roi_text: string
  is_featured: boolean
  sort_order: number
  created_at: string
}

export interface HeroSlide {
  id: string
  title_th: string
  title_en: string
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface SiteConfig {
  key: string
  value: string
  label: string
  updated_at: string
}

export interface Partner {
  id: string
  name: string
  logo_url: string | null
  website: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}
