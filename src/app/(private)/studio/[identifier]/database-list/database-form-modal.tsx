'use client'

import { createDatabase } from '@/actions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ReactNode, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

const defaultValues = {
  database: '',
  collection: '',
}

type Props = {
  children: ReactNode
  onAddDatabase: (database: string, collection: string) => void
  sessionIdentifier: string
}

export function DatabaseFormModal({ children, onAddDatabase, sessionIdentifier }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm({
    defaultValues,
  })

  const createDatabaseAction = useServerAction(createDatabase)

  const onSubmit = async (values: typeof defaultValues) => {
    const [_, err] = await createDatabaseAction.execute({
      identifier: sessionIdentifier,
      database: values.database,
      collection: values.collection,
    })
    if (err) return toast.error(err.message)

    onAddDatabase(values.database, values.collection)
    setIsOpen(false)
    form.reset()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(state) => {
        if (!state) {
          form.reset()
        }
        setIsOpen(state)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
          <DialogTitle>Add database</DialogTitle>
          <div>
            <Label>Database name</Label>
            <Input {...form.register('database', { required: 'Required field' })} placeholder='Type database name' />
          </div>
          <div>
            <Label>Collection name</Label>
            <Input
              {...form.register('collection', { required: 'Required field' })}
              placeholder='Type collection name'
            />
          </div>
          <DialogFooter>
            <Button
              disabled={createDatabaseAction.isPending}
              variant='outline'
              onClick={() => {
                form.reset()
                setIsOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button type='submit' loading={createDatabaseAction.isPending || createDatabaseAction.isSuccess}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
