import './globals.css'

import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/utils/cn'
import type { Metadata } from 'next'
import { Geist as Font } from 'next/font/google'
import type { ReactNode } from 'react'
import { ClientRootLayout } from './root-client-layout'

const font = Font({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'Mongo Studio',
  description: 'A MongoDB admin interface with connection, browsing, and query capabilities',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body
        className={cn(font.className, 'min-h-screen bg-gradient-to-br from-background/0 via-primary/5 to-background/0')}
      >
        <ClientRootLayout>
          {children}
          <Toaster />
        </ClientRootLayout>
      </body>
    </html>
  )
}
