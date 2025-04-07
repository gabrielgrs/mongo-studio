import { cn } from '@/utils/cn'
import { APP_NAME } from '@/utils/constants'
import Image from 'next/image'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('text-lg font-bol text-foreground h-12 w-12', className)}>
      <Image src='/logo.svg' width={512} height={512} alt={APP_NAME} />
    </div>
  )
}
