import Link from 'next/link'
import { ReactNode } from 'react'
import { PublicNavbar } from './public-navbar'

export default function Page({ children }: { children: ReactNode }) {
  return (
    <div className='grid grid-rows-[max-content_auto_max-content] min-h-screen gap-8 mx-auto max-w-3xl px-4'>
      <PublicNavbar />
      {children}
      <footer className='text-center text-sm text-muted-foreground h-20'>
        Support me on{' '}
        <Link
          prefetch={false}
          href='https://buymeacoffee.com/gabrielgrs'
          target='_blank'
          className='text-primary underline underline-offset-4'
        >
          buymeacoffe
        </Link>
      </footer>
    </div>
  )
}
