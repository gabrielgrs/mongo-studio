import { getAuthenticatedUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import { AuthClient } from './client'

type Props = {
  searchParams: Promise<{ redirectTo?: string }>
}
export default async function Page({ searchParams }: Props) {
  const { redirectTo } = await searchParams
  const [authUser] = await getAuthenticatedUser()

  if (Boolean(authUser)) return redirect('/dashboard')
  return <AuthClient redirectTo={redirectTo} />
}
