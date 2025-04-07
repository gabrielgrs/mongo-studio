import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'
import NextLink, { type LinkProps } from 'next/link'
import type { AnchorHTMLAttributes } from 'react'

type Props = LinkProps & AnchorHTMLAttributes<HTMLAnchorElement> & { loading?: boolean; disabled?: boolean }

export function Link({ prefetch = false, children, className, loading, disabled, ...rest }: Props) {
  return (
    <NextLink
      {...rest}
      prefetch={prefetch}
      className={cn(
        'flex items-center gap-2',
        disabled && 'cursor-not-allowed pointer-events-none opacity-50',
        className,
      )}
    >
      {children}
      {loading && <Loader2 size={16} className='animate-spin' />}
    </NextLink>
  )
}
