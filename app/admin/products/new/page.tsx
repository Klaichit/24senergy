import ProductForm from '@/components/admin/ProductForm'

export const metadata = { title: 'เพิ่มผลิตภัณฑ์ — Admin' }

export default function NewProductPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">เพิ่มผลิตภัณฑ์ใหม่</h1>
        <p className="text-sm text-gray-500">กรอกข้อมูลผลิตภัณฑ์และบันทึก</p>
      </div>
      <ProductForm />
    </div>
  )
}
