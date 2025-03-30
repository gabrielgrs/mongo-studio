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
    <Button variant='outline' size='icon' onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dakk' ? <Moon size={20} /> : <Sun size={20} />}
    </Button>
  )
}
