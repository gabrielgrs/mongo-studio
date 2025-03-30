'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import Image from 'next/image'

export function Nav() {
  return (
    <nav className='flex justify-between items-center h-16'>
      <div className='flex items-center gap-2'>
        <Image src='/logo.svg' width={24} height={24} alt='Mongo Studio logo' />
        Mongo Studio
      </div>
      <ThemeToggle />
    </nav>
  )
}
