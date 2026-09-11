import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { PricingContent } from './pricing-content'

export default async function PricingPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  return <PricingContent />
}
