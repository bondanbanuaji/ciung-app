import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SystemPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Sistem</h1>
      <Card>
        <CardHeader><CardTitle>Informasi Aplikasi</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Aplikasi</span><span className="font-medium">Ciung Warna Inventory</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Frontend + Backend</span><span className="font-medium">Next.js 15 + TypeScript</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Database</span><span className="font-medium">PostgreSQL (Supabase)</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">ORM</span><span className="font-medium">Prisma</span></div>
        </CardContent>
      </Card>
    </div>
  )
}
