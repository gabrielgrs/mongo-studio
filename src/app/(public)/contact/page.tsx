'use client'

import { sendContactMessage } from '@/actions/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { displayErrors } from '@/utils/action/client'
import { requiredField } from '@/utils/messages'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

export default function ContactForm() {
  const { handleSubmit, register, reset, control } = useForm({
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  })

  const sendMessageAction = useServerAction(sendContactMessage, {
    onSuccess: () => {
      reset()
      toast.success('Message sent with success')
    },
    onError: (error) => displayErrors(error),
  })

  return (
    <form
      onSubmit={handleSubmit((values) => {
        sendMessageAction.execute(values)
      })}
      className='space-y-4'
    >
      <h1>Contact</h1>
      <Input placeholder='Name' {...register('name')} />
      <Input placeholder='Email' {...register('email', { required: requiredField })} />
      <Controller
        control={control}
        name='subject'
        render={({ field }) => {
          return (
            <Select onValueChange={(e) => field.onChange(e)}>
              <SelectTrigger className='w-full' hasValue={Boolean(field.value)}>
                <SelectValue placeholder='Select' />
              </SelectTrigger>
              <SelectContent>
                {['Contact', 'Feedback', 'Error report'].map((c) => {
                  return (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          )
        }}
      />
      <Textarea placeholder='Message' {...register('message', { required: requiredField })} />
      <div className='flex justify-end'>
        <Button type='submit' loading={sendMessageAction.isPending}>
          Submit
        </Button>
      </div>
    </form>
  )
}
