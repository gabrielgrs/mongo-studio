'use client'

import dynamic from 'next/dynamic'
const NextThemesProvider = dynamic(() => import('next-themes').then((e) => e.ThemeProvider), {
  ssr: false,
})
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect } from 'react'
import { Toaster } from 'sonner'

export function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <NextThemesProvider attribute='class' defaultTheme='dark'>
      <div className='min-h-screen'>{children}</div>
      <Toaster position='top-center' />
    </NextThemesProvider>
  )
}
