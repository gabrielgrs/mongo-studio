'use client'

import { AnimatePresence, motion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export function FadeInLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duraton: 500 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
