import { ConnectionForm } from './connection-form'

export default function Page() {
  return (
    <main className='space-y-4 self-center'>
      <h1 className='text-center px-4'>The ultimate MongoDB data visualization</h1>
      <p className='text-center text-sm text-muted-foreground'>Enter your connection string to get started</p>
      <ConnectionForm />
    </main>
  )
}
