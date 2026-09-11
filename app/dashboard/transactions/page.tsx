import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { TransactionsContent } from './transactions-content'

export default async function TransactionsPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  return <TransactionsContent />
}
