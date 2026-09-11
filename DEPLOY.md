# Deploy ke Vercel (Fullstack TypeScript, tanpa PHP)

Aplikasi ini fullstack Next.js + Prisma + PostgreSQL. Satu repo, satu deploy.

## 1. Siapkan database Supabase (sekali saja)

1. Buat project di https://supabase.com (gratis).
2. Buka **Project Settings → Database → Connection string → URI**.
3. Salin **connection string pooler** (port `6543`, ada `?pgbouncer=true`). Simpan password-nya.
4. Untuk migrate awal, salin juga **connection string direct** (port `5432`).

## 2. Migrate + seed lokal (sekali saja)

```bash
cd ciung-app

# isi .env (lihat .env.example):
#   DATABASE_URL = string pooler (port 6543, ada ?pgbouncer=true) -> runtime harian
#   DIRECT_URL   = string direct/session pooler (port 5432)        -> khusus migrate
#   AUTH_SECRET  = string acak >= 32 karakter
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Login: `admin@ciungwarna.co.id` / `admin123`.

## 3. Deploy ke Vercel

1. Push repo ke GitHub.
2. Di https://vercel.com → **Add New → Project → Import** repo ini.
   - **Root Directory**: `./` (repo ini langsung berisi proyek Next.js).
   - Framework preset: Next.js (otomatis).
3. Tambah **Environment Variables**:
   - `DATABASE_URL` = connection string **pooler** Supabase (port 6543).
   - `AUTH_SECRET` = string acak ≥ 32 karakter (`openssl rand -base64 32`).
4. **Deploy**. Build otomatis menjalankan `prisma generate && next build`.
5. Setelah deploy, jalankan migrate terhadap DB production dari lokal:
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```
   (Pakai `.env` yang menunjuk ke Supabase production. Seed aman diulang:
   pakai `upsert`, tidak duplikat.)

## 4. Anti-pause Supabase (wajib untuk free tier)

Supabase gratis mem-pause project yang nganggur ±7 hari. Repo ini sudah
dilengkapi penangkalnya:

- `app/api/health` — endpoint murah tanpa auth, tiap dipanggil menjalankan
  `SELECT 1` ke database (tercatat sebagai aktivitas).
- `.github/workflows/keep-alive.yml` — GitHub Actions yang mem-ping endpoint
  itu **tiap 3 hari** otomatis, jadi database tidak pernah dianggap nganggur
  meski aplikasi tidak dibuka berminggu-minggu/berbulan-bulan.

Aktifkan sekali saja:

1. Push repo ini ke GitHub (workflow ikut kepush).
2. Di repo GitHub → **Settings → Secrets and variables → Actions** →
   **New repository secret**: `APP_URL` = URL Vercel-mu
   (contoh `https://ciung-app.vercel.app`, tanpa garis miring di akhir).
3. Buka tab **Actions** → jalankan manual sekali via **Run workflow** untuk tes.

Catatan:

- Kalau suatu saat project terlanjur ke-pause (misal workflow belum aktif),
  data **tidak hilang** — buka dashboard Supabase → **Restore/Resume project**.
- Alternatif tanpa GitHub: daftarkan URL `https://<app>/api/health` di
  https://cron-job.org (gratis) dengan interval 2–3 hari.
- Untuk data super kritikal, pertimbangkan Supabase Pro (tanpa pause +
  backup harian retensi panjang) atau backup berkala via `pg_dump`.

## Catatan

- Auth memakai JWT di httpOnly cookie (`session`, 7 hari). Tidak ada server sesi tambahan.
- Export laporan memakai CSV langsung (bisa diunduh di serverless).
- Semua API ada di `app/api/*`, database via Prisma di `app/lib/db.ts`.
