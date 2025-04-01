'use client'

import { generateSession } from '@/actions'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

export function ConnectionForm() {
  const { push } = useRouter()

  const connectionForm = useForm({ defaultValues: { uri: '' } })
  const generateSessionAction = useServerAction(generateSession)

  return (
    <form
      className='space-y-4'
      onSubmit={connectionForm.handleSubmit(async (values) => {
        const [identifier, err] = await generateSessionAction.execute(values.uri)
        if (err) return toast.error(err.message)
        return push(`/studio/${identifier}`)
      })}
    >
      <div className='grid gap-2 relative'>
        <input
          {...connectionForm.register('uri', { required: 'Required field' })}
          className='bg-card p-4 rounded-lg text-sm font-light pr-24 border border-input/0 focus:border-input duration-500'
          placeholder='Type or paste the connection string'
        />
        <Button
          loading={generateSessionAction.isPending || generateSessionAction.isSuccess}
          type='submit'
          className='duration-500 absolute right-2 text-sm text-muted-foreground hover:text-foreground top-[50%] translate-y-[-50%] hover:bg-foreground/10 bg-foreground/5 p-2 rounded-lg'
        >
          Connect
        </Button>
      </div>

      {/* <Button
        type='submit'
        className='w-full'
        loading={generateSessionAction.isPending || generateSessionAction.isSuccess}
      >
        Connect
      </Button> */}
    </form>
  )
}
