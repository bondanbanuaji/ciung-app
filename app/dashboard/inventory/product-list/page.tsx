import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { ProductListContent } from './product-list-content'

export default async function InventoryPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  return (
    <Suspense>
      <ProductListContent />
    </Suspense>
  )
}
