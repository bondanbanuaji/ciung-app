export type StockStatus = 'habis' | 'rendah' | 'aman'
export type TxnType = 'masuk' | 'keluar' | 'adjustment'
export type TxnStatus = 'selesai'
export type UserRole = 'admin' | 'kasir' | 'gudang'
export type UserStatus = 'active' | 'inactive'

export interface Category {
  id: number
  name: string
  slug: string
  icon?: string | null
  color?: string | null
  products_count?: number
}

export interface Supplier {
  id: number
  code: string
  name: string
  company?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  notes?: string | null
}

export interface Customer {
  id: number
  code: string
  name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  notes?: string | null
}

export interface Product {
  id: number
  code: string
  name: string
  category_id?: number | null
  category?: Category | null
  stock: number
  min_stock?: number
  sell_price: number
  cost_price?: number
}

export interface Transaction {
  id: number
  type: TxnType
  product_id: number
  product?: Product | null
  quantity: number
  price?: number
  status: TxnStatus
  created_at: string
}

export interface User {
  id: number
  name: string
  username: string
  email: string
  phone?: string | null
  role?: UserRole
  status?: UserStatus
  avatar?: string | null
}

export interface DashboardStats {
  total_products: number
  total_stock: number
  inventory_value: number
  low_stock_count: number
}

export interface LowStockProduct extends Product {}

export interface ChartData {
  labels: string[]
  datasets: { label: string; data: number[] }[]
}

export interface PaginatedData<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ApiSuccessResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

export interface ApiErrorResponse {
  success: boolean
  message: string
}
