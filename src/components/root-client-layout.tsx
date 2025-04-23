'use client'

// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
const NextThemesProvider = dynamic(() => import('next-themes').then((e) => e.ThemeProvider), {
  ssr: false,
})
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect } from 'react'

// const client = new QueryClient()

export function RootClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    // <QueryClientProvider client={client}>
    <NextThemesProvider attribute='class' defaultTheme='light'>
      {children}
    </NextThemesProvider>
    // </QueryClientProvider>
  )
}
