import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { UsersContent } from './users-content'

export default async function UsersPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  return <UsersContent />
}
