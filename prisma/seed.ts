import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const D = (s: string) => new Date(`${s}T00:00:00Z`)

async function main() {
  // ---- Users (password: admin123 untuk admin, "password" untuk lainnya) ----
  const users = [
    { name: 'Admin Ciung Warna', username: 'admin', email: 'admin@ciungwarna.co.id', password: 'admin123', role: 'admin' as const, status: 'active' as const, avatar: 'https://i.pravatar.cc/200?img=15' },
    { name: 'Rina Marlina', username: 'rina', email: 'rina@ciungwarna.co.id', password: 'password', role: 'kasir' as const, status: 'active' as const, avatar: 'https://i.pravatar.cc/200?img=23' },
    { name: 'Dedi Kurniawan', username: 'dedi', email: 'dedi@ciungwarna.co.id', password: 'password', role: 'gudang' as const, status: 'active' as const, avatar: 'https://i.pravatar.cc/200?img=33' },
    { name: 'Siti Aminah', username: 'siti', email: 'siti@ciungwarna.co.id', password: 'password', role: 'kasir' as const, status: 'inactive' as const, avatar: null },
  ]
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: await bcrypt.hash(u.password, 10) },
    })
  }

  // ---- Categories ----
  const categories = [
    { name: 'Cat Tembok', slug: 'cat', icon: 'Palette', color: '#e0f2fe' },
    { name: 'Cat Kayu & Besi', slug: 'cat-kayu', icon: 'Paintbrush', color: '#ffedd5' },
    { name: 'Semen & Material', slug: 'semen', icon: 'BrickWall', color: '#f1f5f9' },
    { name: 'Pipa & Plumbing', slug: 'pipa', icon: 'Droplets', color: '#e0f2fe' },
    { name: 'Listrik', slug: 'listrik', icon: 'Lightbulb', color: '#fef9c3' },
    { name: 'Perkakas', slug: 'perkakas', icon: 'Wrench', color: '#dcfce7' },
  ]
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c })
  }

  // ---- Suppliers ----
  const suppliers = [
    { code: 'SUP-001', name: 'Budi Santoso', company: 'PT Sumber Warna Abadi', phone: '0812-3456-7890', email: 'budi@sumberwarna.co.id', address: 'Jl. Industri No. 45, Cirebon' },
    { code: 'SUP-002', name: 'Siti Rahayu', company: 'CV Maju Jaya Material', phone: '0821-9876-5432', email: 'siti@majujaya.com', address: 'Jl. Raya Plumbon No. 12, Cirebon' },
    { code: 'SUP-003', name: 'Hendra Wijaya', company: 'PT Indocement Distribusi', phone: '0813-2222-3333', email: 'hendra@indocement.co.id', address: 'Jl. Tuparev No. 88, Cirebon' },
    { code: 'SUP-004', name: 'Agus Prasetyo', company: 'Toko Sumber Listrik', phone: '0857-1111-2222', email: 'agus@sumberlistrik.id', address: 'Jl. Pahlawan No. 7, Cirebon' },
    { code: 'SUP-005', name: 'Rina Marlina', company: 'CV Karya Perkakas', phone: '0819-8888-7777', email: 'rina@karyaperkakas.co.id', address: 'Jl. Kesambi No. 33, Cirebon' },
  ]
  for (const s of suppliers) {
    await prisma.supplier.upsert({ where: { code: s.code }, update: {}, create: { ...s, notes: null } })
  }

  // ---- Customers ----
  const customers = [
    { code: 'CUS-001', name: 'Pak H. Darsono', phone: '0812-0001-0001', email: 'darsono@gmail.com', address: 'Perum Griya Asri Blok A1, Cirebon' },
    { code: 'CUS-002', name: 'CV Cipta Karya', phone: '0822-0002-0002', email: 'admin@ciptakarya.co.id', address: 'Jl. Pilang No. 56, Cirebon' },
    { code: 'CUS-003', name: 'Ibu Lilis', phone: '0813-0003-0003', email: 'lilis@gmail.com', address: 'Jl. Kalijaga No. 21, Cirebon' },
    { code: 'CUS-004', name: 'PT Graha Sentosa', phone: '0811-0004-0004', email: 'purchase@grahasentosa.co.id', address: 'Jl. Bypass No. 99, Cirebon' },
    { code: 'CUS-005', name: 'Toko Bangunan Barokah', phone: '0856-0005-0005', email: 'barokah@gmail.com', address: 'Jl. Pasar Pagi No. 14, Cirebon' },
  ]
  for (const c of customers) {
    await prisma.customer.upsert({ where: { code: c.code }, update: {}, create: { ...c, notes: null } })
  }

  // ---- Products ----
  const catBySlug = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.slug, c.id]))
  const supByCode = Object.fromEntries((await prisma.supplier.findMany()).map((s) => [s.code, s.id]))
  const products: { code: string; name: string; cat: string; unit: string; stock: number; minStock: number; costPrice: number; markup: number; sellingPrice: number; sup: string }[] = [
    { code: 'CW-001', name: 'Cat Tembok Dulux Catylac Putih 25kg', cat: 'cat', unit: 'Kaleng', stock: 48, minStock: 10, costPrice: 485000, markup: 30, sellingPrice: 630500, sup: 'SUP-001' },
    { code: 'CW-002', name: 'Cat Tembok Nippon Vinilex Cream 20kg', cat: 'cat', unit: 'Kaleng', stock: 6, minStock: 8, costPrice: 395000, markup: 30, sellingPrice: 513500, sup: 'SUP-001' },
    { code: 'CW-003', name: 'Cat Kayu Impra Melamin Clear Gloss 1L', cat: 'cat-kayu', unit: 'Kaleng', stock: 0, minStock: 5, costPrice: 125000, markup: 40, sellingPrice: 175000, sup: 'SUP-002' },
    { code: 'CW-004', name: 'Semen Gresik 50kg', cat: 'semen', unit: 'Sak', stock: 120, minStock: 20, costPrice: 58500, markup: 20, sellingPrice: 70200, sup: 'SUP-003' },
    { code: 'CW-005', name: 'Semen Tiga Roda 40kg', cat: 'semen', unit: 'Sak', stock: 15, minStock: 15, costPrice: 52000, markup: 20, sellingPrice: 62400, sup: 'SUP-003' },
    { code: 'CW-006', name: 'Pipa PVC Wavin 3 Inch 4m', cat: 'pipa', unit: 'Batang', stock: 32, minStock: 10, costPrice: 87500, markup: 30, sellingPrice: 113750, sup: 'SUP-002' },
    { code: 'CW-007', name: 'Keran Air Toto TX115 Stainless', cat: 'pipa', unit: 'Pcs', stock: 3, minStock: 5, costPrice: 210000, markup: 50, sellingPrice: 315000, sup: 'SUP-002' },
    { code: 'CW-008', name: 'Lampu LED Philips 12W Putih', cat: 'listrik', unit: 'Pcs', stock: 85, minStock: 20, costPrice: 42500, markup: 40, sellingPrice: 59500, sup: 'SUP-004' },
    { code: 'CW-009', name: 'Stop Kontak Broco Putih', cat: 'listrik', unit: 'Pcs', stock: 0, minStock: 10, costPrice: 18500, markup: 50, sellingPrice: 27750, sup: 'SUP-004' },
    { code: 'CW-010', name: 'Bor Listrik Makita HP1630 13mm', cat: 'perkakas', unit: 'Unit', stock: 7, minStock: 3, costPrice: 875000, markup: 30, sellingPrice: 1137500, sup: 'SUP-005' },
    { code: 'CW-011', name: 'Cat Tembok Jotun Essence Biru Muda 20kg', cat: 'cat', unit: 'Kaleng', stock: 22, minStock: 8, costPrice: 445000, markup: 30, sellingPrice: 578500, sup: 'SUP-001' },
    { code: 'CW-012', name: 'Thinner Impala A Spesial 1L', cat: 'cat-kayu', unit: 'Botol', stock: 40, minStock: 12, costPrice: 32000, markup: 40, sellingPrice: 44800, sup: 'SUP-002' },
    { code: 'CW-013', name: 'Kabel NYM 2x1.5mm 50m Eterna', cat: 'listrik', unit: 'Roll', stock: 18, minStock: 5, costPrice: 285000, markup: 30, sellingPrice: 370500, sup: 'SUP-004' },
    { code: 'CW-014', name: 'Gergaji Kayu Stanley 18 Inch', cat: 'perkakas', unit: 'Pcs', stock: 2, minStock: 4, costPrice: 95000, markup: 40, sellingPrice: 133000, sup: 'SUP-005' },
    { code: 'CW-015', name: 'Bata Ringan Citicon 60x20x10', cat: 'semen', unit: 'Pcs', stock: 540, minStock: 100, costPrice: 7200, markup: 20, sellingPrice: 8640, sup: 'SUP-003' },
    { code: 'CW-016', name: 'Cat Besi Avian Emas 1kg', cat: 'cat-kayu', unit: 'Kaleng', stock: 9, minStock: 6, costPrice: 98000, markup: 30, sellingPrice: 127400, sup: 'SUP-001' },
  ]
  for (const p of products) {
    await prisma.product.upsert({
      where: { code: p.code },
      update: {},
      create: {
        code: p.code, name: p.name, categoryId: catBySlug[p.cat], unit: p.unit,
        stock: p.stock, minStock: p.minStock, costPrice: p.costPrice,
        markup: p.markup, sellingPrice: p.sellingPrice, supplierId: supByCode[p.sup],
        image: null,
      },
    })
  }

  // ---- Stock movements (riwayat, sekali saja) ----
  if ((await prisma.stockMovement.count()) === 0) {
    const prodByCode = Object.fromEntries((await prisma.product.findMany()).map((p) => [p.code, p.id]))
    const custByCode = Object.fromEntries((await prisma.customer.findMany()).map((c) => [c.code, c.id]))
    const admin = await prisma.user.findUniqueOrThrow({ where: { email: 'admin@ciungwarna.co.id' } })
    const rina = await prisma.user.findUniqueOrThrow({ where: { email: 'rina@ciungwarna.co.id' } })
    const mv: { p: string; type: 'masuk' | 'keluar' | 'adjustment'; qty: number; prev: number; next: number; cost?: number; unit?: number; total?: number; sup?: string; cus?: string; reason?: string; user: number; notes?: string; date: string }[] = [
      { p: 'CW-003', type: 'keluar', qty: 3, prev: 3, next: 0, cost: 125000, unit: 175000, total: 525000, cus: 'CUS-003', user: rina.id, notes: 'Penjualan ke Ibu Lilis', date: '2026-08-29' },
      { p: 'CW-007', type: 'adjustment', qty: -1, prev: 4, next: 3, cost: 210000, unit: 0, total: 0, reason: 'Stock Opname - selisih fisik', user: admin.id, date: '2026-08-30' },
      { p: 'CW-004', type: 'keluar', qty: 30, prev: 150, next: 120, cost: 58500, unit: 70200, total: 2106000, cus: 'CUS-002', user: admin.id, notes: 'Penjualan ke CV Cipta Karya', date: '2026-08-30' },
      { p: 'CW-012', type: 'masuk', qty: 24, prev: 16, next: 40, cost: 32000, unit: 32000, total: 768000, sup: 'SUP-002', user: rina.id, notes: 'Pembelian dari CV Maju Jaya Material', date: '2026-08-31' },
      { p: 'CW-015', type: 'masuk', qty: 200, prev: 340, next: 540, cost: 7200, unit: 7200, total: 1440000, sup: 'SUP-003', user: rina.id, notes: 'Pembelian dari PT Indocement Distribusi', date: '2026-09-01' },
      { p: 'CW-010', type: 'keluar', qty: 1, prev: 8, next: 7, cost: 875000, unit: 1137500, total: 1137500, cus: 'CUS-005', user: admin.id, notes: 'Penjualan ke Toko Bangunan Barokah', date: '2026-09-01' },
      { p: 'CW-001', type: 'masuk', qty: 20, prev: 28, next: 48, cost: 485000, unit: 485000, total: 9700000, sup: 'SUP-001', user: admin.id, notes: 'Pembelian dari PT Sumber Warna Abadi', date: '2026-09-02' },
      { p: 'CW-002', type: 'adjustment', qty: -2, prev: 8, next: 6, cost: 395000, unit: 0, total: 0, reason: 'Barang Rusak - kaleng penyok saat pengiriman', user: admin.id, date: '2026-09-02' },
      { p: 'CW-006', type: 'keluar', qty: 10, prev: 42, next: 32, cost: 87500, unit: 113750, total: 1137500, cus: 'CUS-004', user: admin.id, notes: 'Penjualan ke PT Graha Sentosa', date: '2026-09-02' },
      { p: 'CW-004', type: 'masuk', qty: 50, prev: 70, next: 120, cost: 58500, unit: 58500, total: 2925000, sup: 'SUP-003', user: admin.id, notes: 'Pembelian dari PT Indocement Distribusi', date: '2026-09-03' },
      { p: 'CW-001', type: 'keluar', qty: 4, prev: 52, next: 48, cost: 485000, unit: 630500, total: 2522000, cus: 'CUS-002', user: admin.id, notes: 'Penjualan ke CV Cipta Karya', date: '2026-09-03' },
    ]
    for (const m of mv) {
      await prisma.stockMovement.create({
        data: {
          productId: prodByCode[m.p], type: m.type, quantity: m.qty,
          previousStock: m.prev, newStock: m.next,
          costPrice: m.cost ?? null, unitPrice: m.unit ?? null, total: m.total ?? null,
          supplierId: m.sup ? supByCode[m.sup] : null,
          customerId: m.cus ? custByCode[m.cus] : null,
          referenceId: m.sup ?? m.cus ?? null,
          referenceType: m.sup ? 'supplier' : m.cus ? 'customer' : null,
          reason: m.reason ?? null, userId: m.user,
          notes: m.notes ?? null, movementDate: D(m.date),
        },
      })
    }
  }

  console.log('Seed selesai. Login admin: admin@ciungwarna.co.id / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
