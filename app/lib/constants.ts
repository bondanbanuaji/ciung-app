export const ADJUSTMENT_REASONS = ['Barang Rusak', 'Barang Hilang', 'Kesalahan Input', 'Stock Opname', 'Lainnya']

export const USER_ROLES = ['admin', 'kasir', 'gudang'] as const
export type UserRoleValue = (typeof USER_ROLES)[number]
