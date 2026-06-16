import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ProjectForm from '@/components/admin/ProjectForm'
import type { Project } from '@/types/database'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ id: string }> }

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params
  const { data } = await supabase.from('projects').select('*').eq('id', id).single()
  if (!data) notFound()
  return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-gray-900 mb-8">แก้ไขโครงการ</h1>
      <ProjectForm project={data as Project} />
    </div>
  )
}
