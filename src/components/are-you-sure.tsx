'use client'

import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ReactNode, useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

type Props = {
  children: ReactNode
  onConfirm: () => Promise<[unknown, unknown]>
  title?: string
  message?: string
  loading: boolean
  confirmationText?: string
}
export function AreYouSure({
  children,
  onConfirm,
  title = 'Are you sure?',
  message = 'You really want to do this?',
  confirmationText = '',
  loading,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState('')

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogTitle className='pb-4'>{title}</DialogTitle>
        <div>{message}</div>
        {confirmationText && (
          <>
            <Label>
              Type <span className='underline font-bold'>{confirmationText}</span> to delete
            </Label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type ${confirmationText} to remove`}
            />
          </>
        )}
        <div className='flex items-center justify-end gap-2'>
          <DialogClose asChild>
            <Button type='button' variant='outline' disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={value !== confirmationText}
            type='button'
            variant='destructive'
            onClick={() => onConfirm().then(() => setIsOpen(false))}
            loading={loading}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
