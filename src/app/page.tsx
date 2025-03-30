'use client'
import { generateSession } from '@/actions/mongodb'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

export default function Connect() {
  const { push } = useRouter()

  const connectionForm = useForm({ defaultValues: { uri: '' } })
  const generateSessionAction = useServerAction(generateSession)

  return (
    <main>
      <nav className='flex justify-around items-center h-16'>
        <div className='flex items-center gap-2'>
          <Image src='/logo.svg' width={24} height={24} alt='Mongo Studio logo' />
          Mongo Studio
        </div>
        <ThemeToggle />
      </nav>
      <form
        className='mx-auto max-w-lg pt-[10vh] gap-4'
        onSubmit={connectionForm.handleSubmit(async (values) => {
          const [identifier, err] = await generateSessionAction.execute(values.uri)
          if (err) return toast.error(err.message)
          return push(`/studio/${identifier}`)
        })}
      >
        <div className='grid gap-2'>
          <Label htmlFor='connection-string'>Connection String</Label>
          <Input
            {...connectionForm.register('uri', { required: 'Required field' })}
            id='connection-string'
            placeholder='mongodb://localhost:27017'
          />
        </div>

        <Button
          type='submit'
          className='w-full'
          loading={generateSessionAction.isPending || generateSessionAction.isSuccess}
        >
          Connect
        </Button>
      </form>
    </main>
  )
}
