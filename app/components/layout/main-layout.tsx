'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, PackagePlus, PackageMinus, SlidersHorizontal,
  Tag, Truck, Users, BadgePercent, History, BarChart3, Settings, User, Menu, X, Search, Bell, ChevronDown, Boxes, Wrench, LogOut, BookOpen,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/store/auth'
import { StoreMark } from '@/components/brand/store-logo'
import { Modal } from '@/components/ui/modal'
import { apiGet } from '@/lib/client-api'

interface LowProduct {
  code: string
  name: string
  category: string
  stock: number
  unit: string
  status: string
}

interface DashboardNotif {
  stats: { lowStock: number; outOfStock: number }
  lowStockProducts: LowProduct[]
}

const GUIDE_STEPS: { title: string; desc: string }[] = [
  { title: 'Dashboard', desc: 'Pantau ringkasan stok, nilai inventory, dan transaksi hari ini.' },
  { title: 'Semua Barang', desc: 'Tambah, ubah, dan cari barang berdasarkan kode atau nama. Gunakan filter kategori dan status.' },
  { title: 'Barang Masuk', desc: 'Catat setiap stok yang datang dari supplier beserta tanggal dan jumlahnya.' },
  { title: 'Barang Keluar', desc: 'Catat setiap stok yang keluar ke customer beserta tanggal dan jumlahnya.' },
  { title: 'Adjustment', desc: 'Koreksi selisih stok hasil opname. Selalu isi alasan agar tercatat di riwayat.' },
  { title: 'Master Data', desc: 'Kelola kategori, supplier, dan customer sebelum dipakai di transaksi.' },
  { title: 'Harga', desc: 'Atur harga jual dan markup per barang.' },
  { title: 'Riwayat Transaksi', desc: 'Semua pergerakan stok tercatat di sini dan bisa ditelusuri ulang.' },
  { title: 'Laporan', desc: 'Lihat rekap dan cetak laporan inventory.' },
  { title: 'Stok menipis', desc: 'Pantau ikon lonceng di atas — barang yang stoknya <= batas minimal muncul di sana. Segera restock.' },
]

function HelpCard({ onOpenGuide }: { onOpenGuide: () => void }) {
  return (
    <div className="rounded-lg bg-primary/10 p-3">
      <p className="text-xs font-medium text-primary">Butuh bantuan?</p>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Lihat panduan penggunaan.</p>
      <button
        onClick={onOpenGuide}
        className="mt-2 w-full h-8 bg-primary text-primary-foreground rounded-lg text-xs font-medium shadow-[var(--shadow-elevation-1)] hover:shadow-[var(--shadow-elevation-2)] transition-shadow"
      >
        Buka Panduan
      </button>
    </div>
  )
}

interface SidebarNavProps {
  isActive: (path: string) => boolean
  isActivePrefix: (prefix: string) => boolean
  inventoryOpen: boolean
  setInventoryOpen: (v: boolean) => void
  masterOpen: boolean
  setMasterOpen: (v: boolean) => void
  pengaturanOpen: boolean
  setPengaturanOpen: (v: boolean) => void
  onNavigate: () => void
}

function SidebarNav({
  isActive, isActivePrefix,
  inventoryOpen, setInventoryOpen,
  masterOpen, setMasterOpen,
  pengaturanOpen, setPengaturanOpen,
  onNavigate,
}: SidebarNavProps) {
  const inventoryNav = [
    { label: 'Semua Barang', to: '/dashboard/inventory', icon: Boxes },
    { label: 'Barang Masuk', to: '/dashboard/inventory/stock-in', icon: PackagePlus },
    { label: 'Barang Keluar', to: '/dashboard/inventory/stock-out', icon: PackageMinus },
    { label: 'Adjustment', to: '/dashboard/inventory/adjustment', icon: SlidersHorizontal },
  ]

  const masterNav = [
    { label: 'Kategori', to: '/dashboard/master/categories', icon: Tag },
    { label: 'Supplier', to: '/dashboard/master/suppliers', icon: Truck },
    { label: 'Customer', to: '/dashboard/master/customers', icon: Users },
  ]

  const pengaturanNav = [
    { label: 'Profile', to: '/dashboard/settings/profile', icon: User },
    { label: 'User', to: '/dashboard/settings/users', icon: Users },
    { label: 'Sistem', to: '/dashboard/settings/system', icon: Wrench },
  ]

  return (
    <div className="space-y-5">
      <Link href="/dashboard" onClick={onNavigate} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-primary text-primary-foreground shadow-[var(--shadow-elevation-1)]' : 'text-muted-foreground hover:bg-s-muted'}`}>
        <LayoutDashboard size={18} /> Dashboard
      </Link>
      <div>
        <button onClick={() => setInventoryOpen(!inventoryOpen)} className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase hover:text-foreground">
          <span className="flex items-center gap-1.5"><Package size={13} /> Inventory</span>
          <ChevronDown size={13} className={`transition ${inventoryOpen ? '' : '-rotate-90'}`} />
        </button>
        <div className={`mt-1 space-y-0.5 ${inventoryOpen ? '' : 'hidden'}`}>
          {inventoryNav.map((item) => (
            <Link key={item.to} href={item.to} onClick={onNavigate} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ml-1 ${isActive(item.to) ? 'bg-primary text-primary-foreground font-medium shadow-[var(--shadow-elevation-1)]' : 'text-muted-foreground hover:bg-s-muted'}`}>
              <item.icon size={15} /> {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <button onClick={() => setMasterOpen(!masterOpen)} className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
          <span className="flex items-center gap-1.5"><Boxes size={13} /> Master Data</span>
          <ChevronDown size={13} className={`transition ${masterOpen ? '' : '-rotate-90'}`} />
        </button>
        <div className={`mt-1 space-y-0.5 ${masterOpen ? '' : 'hidden'}`}>
          {masterNav.map((item) => (
            <Link key={item.to} href={item.to} onClick={onNavigate} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ml-1 ${isActive(item.to) ? 'bg-primary text-primary-foreground font-medium shadow-[var(--shadow-elevation-1)]' : 'text-muted-foreground hover:bg-s-muted'}`}>
              <item.icon size={15} /> {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <Link href="/dashboard/pricing" onClick={onNavigate} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${isActive('/dashboard/pricing') ? 'bg-primary text-primary-foreground font-medium shadow-[var(--shadow-elevation-1)]' : 'text-muted-foreground hover:bg-s-muted'}`}>
          <BadgePercent size={17} /> Harga
        </Link>
        <Link href="/dashboard/transactions" onClick={onNavigate} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${isActive('/dashboard/transactions') ? 'bg-primary text-primary-foreground font-medium shadow-[var(--shadow-elevation-1)]' : 'text-muted-foreground hover:bg-s-muted'}`}>
          <History size={17} /> Riwayat Transaksi
        </Link>
      </div>
      <Link href="/dashboard/reports" onClick={onNavigate} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActivePrefix('/dashboard/reports') ? 'bg-primary text-primary-foreground shadow-[var(--shadow-elevation-1)]' : 'text-muted-foreground hover:bg-s-muted'}`}>
        <BarChart3 size={18} /> Laporan
      </Link>
      <div>
        <button onClick={() => setPengaturanOpen(!pengaturanOpen)} className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
          <span className="flex items-center gap-1.5"><Settings size={13} /> Pengaturan</span>
          <ChevronDown size={13} className={`transition ${pengaturanOpen ? '' : '-rotate-90'}`} />
        </button>
        <div className={`mt-1 space-y-0.5 ${pengaturanOpen ? '' : 'hidden'}`}>
          {pengaturanNav.map((item) => (
            <Link key={item.to} href={item.to} onClick={onNavigate} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ml-1 ${isActive(item.to) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-s-muted'}`}>
              <item.icon size={15} /> {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [inventoryOpen, setInventoryOpen] = useState(true)
  const [masterOpen, setMasterOpen] = useState(true)
  const [pengaturanOpen, setPengaturanOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [headerQ, setHeaderQ] = useState('')
  const [notifData, setNotifData] = useState<DashboardNotif | null>(null)
  const [notifLoading, setNotifLoading] = useState(false)

  const isActive = (path: string) => pathname === path
  const isActivePrefix = (prefix: string) => pathname.startsWith(prefix)

  // Tutup drawer & dropdown setiap pindah halaman
  useEffect(() => {
    setSidebarOpen(false)
    setNotifOpen(false)
    setProfileOpen(false)
  }, [pathname])

  // Escape + kunci scroll saat drawer mobile terbuka
  useEffect(() => {
    if (!sidebarOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [sidebarOpen])

  const handleLogout = async () => {
    setNotifOpen(false)
    setProfileOpen(false)
    try {
      await logout()
    } catch {}
    router.push('/login')
    router.refresh()
  }

  const toggleNotif = async () => {
    const next = !notifOpen
    setNotifOpen(next)
    setProfileOpen(false)
    if (next && !notifData && !notifLoading) {
      setNotifLoading(true)
      try {
        const res = await apiGet<{ success: boolean; data: DashboardNotif }>('/api/dashboard')
        setNotifData(res.data)
      } catch {
        setNotifData(null)
      } finally {
        setNotifLoading(false)
      }
    }
  }

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const keyword = headerQ.trim()
    if (!keyword) return
    setNotifOpen(false)
    setProfileOpen(false)
    router.push(`/dashboard/inventory?q=${encodeURIComponent(keyword)}`)
  }

  const alertCount = (notifData?.stats.lowStock ?? 0) + (notifData?.stats.outOfStock ?? 0)

  const pageTitle = (routeMeta: Record<string, string> | undefined) => {
    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/dashboard/inventory': 'Semua Barang',
      '/dashboard/inventory/stock-in': 'Barang Masuk',
      '/dashboard/inventory/stock-out': 'Barang Keluar',
      '/dashboard/inventory/adjustment': 'Adjustment Stok',
      '/dashboard/master/categories': 'Kategori',
      '/dashboard/master/suppliers': 'Supplier',
      '/dashboard/master/customers': 'Customer',
      '/dashboard/transactions': 'Riwayat Transaksi',
      '/dashboard/reports': 'Laporan',
      '/dashboard/settings/profile': 'Profil',
      '/dashboard/settings/users': 'User & Akses',
      '/dashboard/settings/system': 'Sistem',
      '/dashboard/pricing': 'Harga',
    }
    return routeMeta?.[pathname] || titles[pathname] || 'Dashboard'
  }

  const sidebarNavProps = {
    isActive,
    isActivePrefix,
    inventoryOpen,
    setInventoryOpen,
    masterOpen,
    setMasterOpen,
    pengaturanOpen,
    setPengaturanOpen,
    onNavigate: () => setSidebarOpen(false),
  }

  return (
    <div className="min-h-screen flex bg-background antialiased">
      <aside className="hidden lg:flex w-[268px] shrink-0 flex-col bg-surface sticky top-0 h-screen overflow-hidden text-sidebar-foreground shadow-[var(--shadow-elevation-3)]">
        <div className="h-14 lg:h-16 px-6 flex items-center gap-3 shrink-0">
          <StoreMark size={32} />
        </div>
        <div className="flex-1 overflow-y-auto py-3 px-3">
          <SidebarNav {...sidebarNavProps} />
        </div>
        <div className="p-3 shrink-0">
          <HelpCard onOpenGuide={() => setGuideOpen(true)} />
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md shadow-[var(--shadow-elevation-2)] flex items-center gap-2 px-3 md:px-4 lg:px-6 h-14 lg:h-16 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-s-muted shrink-0" aria-label="Buka menu">
            <Menu size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-foreground leading-none text-[15px] lg:text-base truncate">{pageTitle(undefined)}</h1>
            <p className="text-xs text-muted-foreground hidden sm:block mt-0.5 truncate">Kelola inventory Ciung Warna</p>
          </div>
          <form onSubmit={submitSearch} className="hidden md:flex items-center gap-2 bg-s-muted rounded-lg px-3 h-9 w-[260px] lg:w-[300px] shadow-[var(--shadow-border)] shrink-0">
            <Search size={16} className="text-muted-foreground/50 shrink-0" />
            <input
              value={headerQ}
              onChange={(e) => setHeaderQ(e.target.value)}
              placeholder="Cari kode / nama barang..."
              aria-label="Cari barang"
              className="bg-transparent outline-none text-sm flex-1 min-w-0 placeholder:text-muted-foreground/50"
            />
          </form>
          <div className="relative shrink-0">
            <button onClick={toggleNotif} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-s-muted shrink-0 relative" aria-label="Notifikasi" aria-expanded={notifOpen}>
              <Bell size={18} className="text-muted-foreground" />
              {alertCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl bg-card p-2 shadow-[var(--shadow-elevation-3)] border border-border">
                <p className="px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Peringatan stok</p>
                {notifLoading ? (
                  <p className="px-2 py-4 text-center text-sm text-muted-foreground">Memuat...</p>
                ) : !notifData ? (
                  <p className="px-2 py-4 text-center text-sm text-muted-foreground">Gagal memuat notifikasi.</p>
                ) : alertCount === 0 ? (
                  <p className="px-2 py-4 text-center text-sm text-muted-foreground">Semua stok aman. Tidak ada peringatan.</p>
                ) : (
                  <div className="max-h-72 overflow-y-auto">
                    {notifData.lowStockProducts.map((p) => (
                      <Link
                        key={p.code}
                        href="/dashboard/inventory"
                        className="flex items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-s-muted"
                      >
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${p.stock === 0 ? 'bg-destructive' : 'bg-warning'}`} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">{p.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {p.stock === 0 ? 'Stok habis' : `Stok menipis — sisa ${p.stock} ${p.unit}`} • {p.category}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
                <Link
                  href="/dashboard/inventory"
                  className="mt-1 block rounded-lg px-2 py-2 text-center text-xs font-semibold text-primary hover:bg-primary/10"
                >
                  Lihat inventory
                </Link>
              </div>
            )}
          </div>
          <div className="relative hidden sm:block shrink-0">
            <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }} className="flex items-center gap-2.5 pl-3" aria-label="Menu pengguna" aria-expanded={profileOpen}>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm hidden lg:flex">{(user?.name ?? 'A').charAt(0).toUpperCase()}</div>
              <div className="hidden lg:block leading-tight text-left">
                <p className="text-sm font-medium text-foreground leading-none">{user?.name ?? 'Memuat...'}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role ?? ''}</p>
              </div>
              <ChevronDown size={16} className={`text-muted-foreground hidden lg:block transition ${profileOpen ? 'rotate-180' : ''}`} />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-56 rounded-xl bg-card p-2 shadow-[var(--shadow-elevation-3)] border border-border">
                <div className="px-2 pb-2 pt-1">
                  <p className="truncate text-sm font-medium text-foreground">{user?.name ?? 'Memuat...'}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role ?? ''}</p>
                </div>
                <Link
                  href="/dashboard/settings/profile"
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-s-muted"
                >
                  <User size={15} className="text-muted-foreground" /> Profil saya
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-destructive hover:bg-red-50"
                >
                  <LogOut size={15} /> Keluar
                </button>
              </div>
            )}
          </div>
          {(notifOpen || profileOpen) && (
            <div
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => { setNotifOpen(false); setProfileOpen(false) }}
            />
          )}
          <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-50 sm:hidden shrink-0" aria-label="Keluar">
            <LogOut size={18} className="text-destructive" />
          </button>
        </header>
        <main className="flex-1 p-3 md:p-4 lg:p-6 bg-background pb-20 lg:pb-6">
          {children}
        </main>
        <footer className="hidden lg:flex px-6 py-3 bg-surface shadow-[var(--shadow-elevation-1)] text-xs text-muted-foreground justify-between">
          <span>&copy; 2026 Ciung Warna — Inventory Management</span>
          <span className="font-mono">Next.js • Prisma • PostgreSQL</span>
        </footer>
      </div>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md shadow-[0_-1px_8px_rgba(16,24,40,0.06)] flex items-stretch h-[64px]">
        {[
          { label: 'Beranda', icon: LayoutDashboard, to: '/dashboard', active: isActive('/dashboard') },
          { label: 'Inventory', icon: Package, to: '/dashboard/inventory', active: isActivePrefix('/dashboard/inventory') },
          { label: 'Transaksi', icon: History, to: '/dashboard/transactions', active: isActive('/dashboard/transactions') },
          { label: 'Laporan', icon: BarChart3, to: '/dashboard/reports', active: isActivePrefix('/dashboard/reports') },
          { label: 'Menu', icon: Menu, action: () => setSidebarOpen(true), active: false },
        ].map((item) => (
          item.to ? (
            <Link key={item.label} href={item.to} className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 ${item.active ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}>
              <item.icon size={20} className={item.active ? 'text-primary' : ''} />
              <span className="text-[11px] font-medium leading-none truncate">{item.label}</span>
            </Link>
          ) : (
            <button key={item.label} onClick={item.action} className="flex-1 flex flex-col items-center justify-center gap-1 py-1 text-muted-foreground">
              <item.icon size={20} />
              <span className="text-[11px] font-medium leading-none">{item.label}</span>
            </button>
          )
        ))}
      </nav>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-surface text-sidebar-foreground shadow-[var(--shadow-elevation-3)]">
            <div className="flex h-14 shrink-0 items-center justify-between px-4">
              <StoreMark size={28} />
              <button onClick={() => setSidebarOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-s-muted" aria-label="Tutup menu">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3">
              <SidebarNav {...sidebarNavProps} />
            </div>
            <div className="space-y-3 border-t border-border p-3">
              <HelpCard
                onOpenGuide={() => {
                  setSidebarOpen(false)
                  setGuideOpen(true)
                }}
              />
              <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-red-50">
                <LogOut size={17} /> Keluar
              </button>
            </div>
          </aside>
        </div>
      )}
      <Modal open={guideOpen} onOpenChange={setGuideOpen} title="Panduan Penggunaan">
        <div className="max-h-[60vh] overflow-y-auto pr-1">
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-xs text-muted-foreground">
            <BookOpen size={15} className="shrink-0 text-primary" />
            Alur singkat memakai aplikasi Ciung Warna dari awal sampai laporan.
          </div>
          <ol className="mt-3 space-y-3">
            {GUIDE_STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{s.title}</span>
                  <span className="block text-xs leading-relaxed text-muted-foreground">{s.desc}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Modal>
    </div>
  )
}
