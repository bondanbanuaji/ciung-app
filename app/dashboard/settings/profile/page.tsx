import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { ProfileContent } from './profile-content'

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')
  return <ProfileContent />
}
