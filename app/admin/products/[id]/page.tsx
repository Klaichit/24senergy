import { supabase } from '@/lib/supabase'
import ProductForm from '@/components/admin/ProductForm'
import { notFound } from 'next/navigation'
import type { Product } from '@/types/database'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) notFound()

  const product = data as Product

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">แก้ไขผลิตภัณฑ์</h1>
        <p className="text-sm text-gray-500 font-mono">{product.slug}</p>
      </div>
      <ProductForm product={product} />
    </div>
  )
}
