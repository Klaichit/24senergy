import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import HeroSlideForm from '@/components/admin/HeroSlideForm'
import type { HeroSlide } from '@/types/database'
export const dynamic = 'force-dynamic'
interface Props { params: Promise<{ id: string }> }
export default async function EditHeroPage({ params }: Props) {
  const { id } = await params
  const { data } = await supabase.from('hero_slides').select('*').eq('id', id).single()
  if (!data) notFound()
  return <div className="p-8"><h1 className="text-2xl font-black text-gray-900 mb-8">แก้ไข Hero Slide</h1><HeroSlideForm slide={data as HeroSlide} /></div>
}
