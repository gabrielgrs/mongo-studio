import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className='mx-auto max-w-2xl'>{children}</div>
}
