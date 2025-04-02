import { APP_DESCRIPTION } from '@/utils/constants'
import { ConnectionForm } from './connection-form'

export default function Page() {
  return (
    <main className='space-y-4 self-center'>
      <div className='flex items-center justify-center'>
        <span className='text-sm text-accent/70 border-accent/50 border px-2 py-0.5 rounded-full bg-accent/10'>
          Database
        </span>
      </div>
      <h1 className='text-center px-4'>{APP_DESCRIPTION}</h1>
      <p className='text-center text-sm text-muted-foreground'>Enter your connection string to get started</p>
      <ConnectionForm />
    </main>
  )
}
