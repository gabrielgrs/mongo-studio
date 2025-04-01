'use client'

import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Button
      variant='outline'
      size='icon'
      className='h-8 w-8'
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dakk' ? <Moon size={18} /> : <Sun size={18} />}
    </Button>
  )
}
