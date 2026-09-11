'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData) {
  revalidatePath('/dashboard/inventory')
  redirect('/dashboard/inventory')
}

export async function updateProduct(code: string, formData: FormData) {
  revalidatePath('/dashboard/inventory')
}

export async function deleteProduct(code: string) {
  revalidatePath('/dashboard/inventory')
}
