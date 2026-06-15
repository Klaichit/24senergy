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

type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>
type ProductUpdate = Partial<ProductInsert>
type QuoteInsert = Omit<Quote, 'id' | 'created_at' | 'status'> & { status?: QuoteStatus }
type QuoteUpdate = Partial<Omit<Quote, 'id' | 'created_at'>>

export type Database = {
  public: {
    Tables: {
      products: {
        Row: Product
        Insert: ProductInsert
        Update: ProductUpdate
        Relationships: []
      }
      quotes: {
        Row: Quote
        Insert: QuoteInsert
        Update: QuoteUpdate
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
