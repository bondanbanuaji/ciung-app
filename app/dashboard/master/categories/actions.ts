'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCategory(formData: FormData) {
  revalidatePath('/dashboard/master/categories')
  redirect('/dashboard/master/categories')
}

export async function updateCategory(id: number, formData: FormData) {
  revalidatePath('/dashboard/master/categories')
}

export async function deleteCategory(id: number) {
  revalidatePath('/dashboard/master/categories')
}
