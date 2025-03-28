'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect } from 'react'
const NextThemesProvider = dynamic(() => import('next-themes').then((e) => e.ThemeProvider), {
  ssr: false,
})

export function ClientRootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <NextThemesProvider attribute='class' defaultTheme='light' enableSystem={false}>
      {children}
    </NextThemesProvider>
  )
}
