import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authOr401, dayBounds, num } from '@/lib/api-helpers'

// Export CSV langsung (format=csv) agar bisa diunduh di Vercel tanpa worker.
// format=excel mengembalikan JSON status seperti Laravel lama.
export async function GET(request: NextRequest) {
  const { error } = await authOr401()
  if (error) return error
  const url = new URL(request.url)
  const tab = url.searchParams.get('tab') ?? 'stok'
  const format = url.searchParams.get('format') ?? 'csv'
  const dateFrom = url.searchParams.get('date_from') ?? ''
  const dateTo = url.searchParams.get('date_to') ?? ''
  const categoryId = Number(url.searchParams.get('category_id')) || 0
  const supplierId = Number(url.searchParams.get('supplier_id')) || 0
  const customerId = Number(url.searchParams.get('customer_id')) || 0

  const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  const filename = `laporan-${tab}-${stamp}.csv`

  const escape = (v: unknown) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
  }

  if (tab === 'stok') {
    const where: Record<string, unknown> = { deletedAt: null }
    if (categoryId) where.categoryId = categoryId
    if (supplierId) where.supplierId = supplierId
    const rows = await db.product.findMany({ where, include: { category: true, supplier: true }, orderBy: { name: 'asc' } })
    const csv = [
      'Kode,Nama,Kategori,Stok,Satuan,Harga Modal,Harga Jual,Nilai Stok',
      ...rows.map((p) =>
        [p.code, p.name, p.category.name, p.stock, p.unit, num(p.costPrice), num(p.sellingPrice), p.stock * num(p.costPrice)].map(escape).join(',')
      ),
    ].join('\n')
    return new NextResponse(csv, {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` },
    })
  }

  const where: Record<string, unknown> = { type: tab === 'penjualan' ? 'keluar' : tab }
  if (dateFrom) where.movementDate = { ...((where.movementDate as object | undefined) ?? {}), gte: dayBounds(dateFrom).gte }
  if (dateTo) where.movementDate = { ...((where.movementDate as object | undefined) ?? {}), lt: dayBounds(dateTo).lt }
  if (categoryId) where.product = { categoryId }
  if (supplierId) where.supplierId = supplierId
  if (customerId) where.customerId = customerId

  if (format !== 'csv') {
    return NextResponse.json({ success: true, message: `Export ${format} untuk laporan ${tab} belum didukung, gunakan format=csv.`, filename })
  }

  const rows = await db.stockMovement.findMany({
    where,
    include: { product: { include: { category: true } }, supplier: true, customer: true },
    orderBy: [{ movementDate: 'desc' }, { id: 'desc' }],
    take: 5000,
  })
  const csv = [
    'Tanggal,Tipe,Kode Produk,Nama Produk,Kategori,Qty,Harga Satuan,Total,Supplier,Customer',
    ...rows.map((m) =>
      [
        m.movementDate.toISOString().slice(0, 10), m.type, m.product.code, m.product.name,
        m.product.category.name, m.quantity,
        m.unitPrice == null ? 0 : num(m.unitPrice), m.total == null ? 0 : num(m.total),
        m.supplier?.company ?? '', m.customer?.name ?? '',
      ].map(escape).join(',')
    ),
  ].join('\n')
  return new NextResponse(csv, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` },
  })
}
