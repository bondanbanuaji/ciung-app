import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { StockInForm } from '@/components/forms/stock-in-form'

export default async function StockInPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  return <StockInForm />
}
