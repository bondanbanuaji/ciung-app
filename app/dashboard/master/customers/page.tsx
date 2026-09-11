import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { PartnerContent } from '../partner-content'

export default async function CustomersPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  return <PartnerContent kind="customers" title="Customer" single="Customer" />
}
