'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/utils/cn'
import { APP_NAME } from '@/utils/constants'
import { ChevronDown, Home, LogOut, LucideIcon, Moon, Sun } from 'lucide-react'
import { motion } from 'motion/react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

type Props = { children: ReactNode; icon: LucideIcon; href?: string; onClick?: () => void }

const className = 'relative flex items-center gap-1 px-2 py-0.5 text-muted-foreground'

function Item({ children, icon: Icon, onClick, href }: Props) {
  const pathname = usePathname()

  if (href) {
    return (
      <Link className={cn(className)} href={href} prefetch={false}>
        {href.includes(pathname) && (
          <motion.div layoutId='nav-active' className='absolute left-0 top-0 w-full h-full bg-foreground rounded-md' />
        )}
        <Icon size={20} />
        {children}
      </Link>
    )
  }

  return (
    <button className={className} onClick={onClick}>
      <Icon size={20} />
      {children}
    </button>
  )
}

export function PrivateNavbar() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()

  return (
    <header className='flex justify-between items-center gap-2 sticky top-0 h-16 border-b shadow z-50 backdrop-blur-lg px-4'>
      <div className='flex items-center justify-center gap-2'>
        <Image src='/logo.svg' width={24} height={24} alt='Mongo Studio logo' />
        <span className='hidden md:block whitespace-nowrap'>{APP_NAME}</span>
      </div>
      <nav className='flex w-full items-center justify-end gap-4'>
        <Item icon={Home} href='/'>
          Home
        </Item>

        <DropdownMenu>
          <DropdownMenuTrigger className='h-full'>
            <div className='flex items-center gap-1 truncate justify-center'>
              <div className='text-left'>
                <p className='truncate text-sm'>{user.name}</p>
                <p className='truncate text-xs text-muted-foreground'>{user.email}</p>
              </div>
              <ChevronDown size={20} className='shrink-0' />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Item icon={theme === 'dark' ? Sun : Moon} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                Theme
              </Item>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Item icon={LogOut} href='/'>
                Logout
              </Item>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  )
}
