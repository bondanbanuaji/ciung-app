import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { StockOutContent } from './stock-out-content'

export default async function StockOutPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  return <StockOutContent />
}
