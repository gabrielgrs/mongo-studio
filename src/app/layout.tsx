import './globals.css'

import { RootClientLayout } from '@/components/root-client-layout'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/utils/cn'
import { generateMetadata } from '@/utils/metadata'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Geist as Font } from 'next/font/google'
import type { ReactNode } from 'react'

const font = Font({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

export const metadata = generateMetadata()

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body className={cn(font.className, 'min-h-screen bg-gradient-to-b from-background via-background to-accent/10')}>
        <RootClientLayout>
          {children}
          <Toaster position='top-center' richColors />
        </RootClientLayout>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
