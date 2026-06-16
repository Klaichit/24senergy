import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import PartnerForm from '@/components/admin/PartnerForm'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ id: string }> }

export default async function EditPartnerPage({ params }: Props) {
  const { id } = await params
  const { data } = await supabase.from('partners').select('*').eq('id', id).single()
  if (!data) notFound()
  return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-gray-900 mb-8">แก้ไข Partner</h1>
      <PartnerForm partner={data} />
    </div>
  )
}
