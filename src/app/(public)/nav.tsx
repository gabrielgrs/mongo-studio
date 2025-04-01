'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { buttonVariants } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

export function Nav() {
  return (
    <header className='flex justify-between items-center h-16'>
      <Link href='/' prefetch={false} className='flex items-center gap-2'>
        <Image src='/logo.svg' width={24} height={24} alt='Mongo Studio logo' />
        Mongo Studio
      </Link>
      <nav className='flex items-center gap-2'>
        <Link href='/contact' className={buttonVariants({ variant: 'ghost' })}>
          Contact
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  )
}
