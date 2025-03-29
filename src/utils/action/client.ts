'use client'

import { toast } from 'sonner'

export function displayErrors({ err }: { err: any }): void {
  if (err.fieldErrors) {
    return Object.entries(err.fieldErrors).forEach(([key, value]) =>
      toast.error(`${key}: ${Array.isArray(value) ? value[0] : value}`),
    )
  }
  toast.error(err.message || 'Failed. Try again later.')
  return
}
