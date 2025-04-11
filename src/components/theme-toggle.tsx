'use client'

import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'

import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant='outline'
      size='icon'
      className='w-full'
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
      Toggle theme
    </Button>
  )
}
