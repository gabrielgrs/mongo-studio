import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getDomain() {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const headersData = await headers()
  const host = headersData.get('host')
  return `${protocol}://${host}`
}

export async function redirectToNotFound() {
  return redirect('/not-found')
}
