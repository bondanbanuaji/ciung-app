import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Seed minimal: hanya bootstrap 1 akun admin agar sistem bisa login.
// Registrasi publik dinonaktifkan (POST /api/auth/register -> 404),
// sehingga tanpa akun ini aplikasi akan terkunci total.
// TIDAK ada data dummy: tidak ada kategori/supplier/customer/produk/transaksi contoh.
// Jalankan sekali: `npm run db:seed`. Aman diulang (upsert).
// Kredensial default bisa dioverride via env: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@ciungwarna.co.id'
  const username = process.env.SEED_ADMIN_USERNAME ?? 'admin'
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'admin123'

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: 'Administrator',
      username,
      email,
      password: await bcrypt.hash(password, 10),
      role: 'admin',
      status: 'active',
      avatar: null,
    },
  })

  console.log(`Seed selesai. Admin bootstrap siap: ${email} (ganti password setelah login pertama).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
