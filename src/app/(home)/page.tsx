import Link from 'next/link'
import { ConnectionForm } from './connection-form'
import { Nav } from './nav'

export default function Page() {
  return (
    <div className='grid grid-rows-[max-content_auto_max-content] min-h-screen gap-8 mx-auto max-w-3xl px-4'>
      <Nav />
      <main className='space-y-4 self-center'>
        <h1 className='text-center px-4'>The ultimate MongoDB data visualization</h1>
        <p className='text-center text-sm text-muted-foreground'>Enter your connection string to get started</p>
        <ConnectionForm />
      </main>
      <footer className='text-center text-sm text-muted-foreground py-4'>
        Made by{' '}
        <Link
          prefetch={false}
          href='https://github.com/gabrielgrs'
          target='_blank'
          className='text-primary underline underline-offset-4'
        >
          gabrielgrs
        </Link>
      </footer>
    </div>
  )
}
