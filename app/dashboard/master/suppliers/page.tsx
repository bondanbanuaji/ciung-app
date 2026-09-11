import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { PartnerContent } from '../partner-content'

export default async function SuppliersPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  return <PartnerContent kind="suppliers" title="Supplier" single="Supplier" />
}
