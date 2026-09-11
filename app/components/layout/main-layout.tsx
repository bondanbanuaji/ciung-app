'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, PackagePlus, PackageMinus, SlidersHorizontal,
  Tag, Truck, Users, BadgePercent, History, BarChart3, Settings, User, Menu, X, Search, Bell, ChevronDown, Boxes, Wrench, LogOut,
} from 'lucide-react'
import Link from 'next/link'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [inventoryOpen, setInventoryOpen] = useState(true)
  const [masterOpen, setMasterOpen] = useState(true)
  const [pengaturanOpen, setPengaturanOpen] = useState(false)

  const isActive = (path: string) => pathname === path
  const isActivePrefix = (prefix: string) => pathname.startsWith(prefix)

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

  return (
    <div className="min-h-screen flex bg-background antialiased">
      <aside className="hidden lg:flex w-[268px] shrink-0 flex-col bg-surface sticky top-0 h-screen overflow-hidden text-sidebar-foreground shadow-[var(--shadow-elevation-3)]">
        <div className="h-14 lg:h-16 px-6 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">CW</div>
          <div className="min-w-0">
            <p className="font-semibold text-sidebar-foreground leading-none text-[14px] truncate">Ciung Warna</p>
            <p className="text-[11px] tracking-widest font-medium text-muted-foreground uppercase mt-0.5">Inventory</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
          <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-primary text-primary-foreground shadow-[var(--shadow-elevation-1)]' : 'text-muted-foreground hover:bg-s-muted'}`}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <div>
            <button onClick={() => setInventoryOpen(!inventoryOpen)} className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase hover:text-foreground">
              <span className="flex items-center gap-1.5"><Package size={13} /> Inventory</span>
              <ChevronDown size={13} className={`transition ${inventoryOpen ? '' : '-rotate-90'}`} />
            </button>
            <div className={`mt-1 space-y-0.5 ${inventoryOpen ? '' : 'hidden'}`}>
              {inventoryNav.map((item) => (
                <Link key={item.to} href={item.to} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ml-1 ${isActive(item.to) ? 'bg-primary text-primary-foreground font-medium shadow-[var(--shadow-elevation-1)]' : 'text-muted-foreground hover:bg-s-muted'}`}>
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
                <Link key={item.to} href={item.to} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ml-1 ${isActive(item.to) ? 'bg-primary text-primary-foreground font-medium shadow-[var(--shadow-elevation-1)]' : 'text-muted-foreground hover:bg-s-muted'}`}>
                  <item.icon size={15} /> {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Link href="/dashboard/pricing" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${isActive('/dashboard/pricing') ? 'bg-primary text-primary-foreground font-medium shadow-[var(--shadow-elevation-1)]' : 'text-muted-foreground hover:bg-s-muted'}`}>
              <BadgePercent size={17} /> Harga
            </Link>
            <Link href="/dashboard/transactions" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${isActive('/dashboard/transactions') ? 'bg-primary text-primary-foreground font-medium shadow-[var(--shadow-elevation-1)]' : 'text-muted-foreground hover:bg-s-muted'}`}>
              <History size={17} /> Riwayat Transaksi
            </Link>
          </div>
          <Link href="/dashboard/reports" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActivePrefix('/dashboard/reports') ? 'bg-primary text-primary-foreground shadow-[var(--shadow-elevation-1)]' : 'text-muted-foreground hover:bg-s-muted'}`}>
            <BarChart3 size={18} /> Laporan
          </Link>
          <div>
            <button onClick={() => setPengaturanOpen(!pengaturanOpen)} className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
              <span className="flex items-center gap-1.5"><Settings size={13} /> Pengaturan</span>
              <ChevronDown size={13} className={`transition ${pengaturanOpen ? '' : '-rotate-90'}`} />
            </button>
            <div className={`mt-1 space-y-0.5 ${pengaturanOpen ? '' : 'hidden'}`}>
              {pengaturanNav.map((item) => (
                <Link key={item.to} href={item.to} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ml-1 ${isActive(item.to) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-s-muted'}`}>
                  <item.icon size={15} /> {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="p-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <p className="text-xs font-medium text-primary">Butuh bantuan?</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Lihat panduan penggunaan.</p>
            <button className="mt-2 w-full h-8 bg-primary text-primary-foreground rounded-lg text-xs font-medium shadow-[var(--shadow-elevation-1)] hover:shadow-[var(--shadow-elevation-2)] transition-shadow">Buka Panduan</button>
          </div>
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md shadow-[var(--shadow-elevation-2)] flex items-center gap-2 px-3 md:px-4 lg:px-6 h-14 lg:h-16 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-s-muted shrink-0" aria-label="Buka menu">
            <Menu size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-foreground leading-none text-[15px] lg:text-base truncate">{pageTitle(undefined)}</h1>
            <p className="text-xs text-muted-foreground hidden sm:block mt-0.5 truncate">Kelola inventory Ciung Warna</p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-s-muted rounded-lg px-3 h-9 w-[260px] lg:w-[300px] shadow-[var(--shadow-border)] shrink-0">
            <Search size={16} className="text-muted-foreground/50 shrink-0" />
            <input placeholder="Cari barang, supplier..." className="bg-transparent outline-none text-sm flex-1 min-w-0 placeholder:text-muted-foreground/50" />
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-s-muted shrink-0 relative" aria-label="Notifikasi">
            <Bell size={18} className="text-muted-foreground" />
          </button>
          <div className="hidden sm:flex items-center gap-2.5 pl-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm hidden lg:flex">A</div>
            <div className="hidden lg:block leading-tight">
              <p className="text-sm font-medium text-foreground leading-none">Admin Ciung</p>
              <p className="text-xs text-muted-foreground capitalize">administrator</p>
            </div>
            <ChevronDown size={16} className="text-muted-foreground hidden lg:block" />
          </div>
          <button onClick={async () => { try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }) } catch {} router.push('/login'); router.refresh() }} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-50 sm:hidden shrink-0" aria-label="Keluar">
            <LogOut size={18} className="text-destructive" />
          </button>
        </header>
        <main className="flex-1 p-3 md:p-4 lg:p-6 bg-background pb-20 lg:pb-6">
          {children}
        </main>
        <footer className="hidden lg:flex px-6 py-3 bg-surface shadow-[var(--shadow-elevation-1)] text-xs text-muted-foreground justify-between">
          <span>&copy; 2026 Ciung Warna — Inventory Management</span>
          <span className="font-mono">React • Next.js • Tailwind • Laravel API</span>
        </footer>
      </div>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md shadow-[0_-1px_8px_rgba(16,24,40,0.06)] flex items-stretch h-[64px]">
        {[
          { label: 'Beranda', icon: LayoutDashboard, to: '/dashboard', active: isActive('/dashboard') },
          { label: 'Inventory', icon: Package, to: '/dashboard/inventory', active: isActivePrefix('/dashboard/inventory') },
          { label: 'Transaksi', icon: History, to: '/dashboard/transactions', active: isActive('/dashboard/transactions') },
          { label: 'Laporan', icon: BarChart3, to: '/dashboard/reports', active: isActivePrefix('/dashboard/reports') },
          { label: 'Menu', action: () => setSidebarOpen(true), active: false },
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
    </div>
  )
}
