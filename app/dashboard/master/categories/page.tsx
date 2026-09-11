import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { CategoriesContent } from './categories-content'

export default async function CategoriesPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  return <CategoriesContent />
}
