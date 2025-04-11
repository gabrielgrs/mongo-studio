'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'

export function PublicNavbar() {
  const { theme, setTheme } = useTheme()

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
        <Button variant='outline' size='icon' onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </Button>
      </nav>
    </header>
  )
}
