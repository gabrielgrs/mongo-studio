import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'
export * from './column'

export function Grid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-12 gap-4', className)}>{children}</div>
}
