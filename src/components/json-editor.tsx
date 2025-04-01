'use client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'
import { AlertCircle, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'

type JsonEditorProps = {
  initialValue?: Record<string, unknown>
  onSubmit: (value: Record<string, unknown>) => void
  onCancel?: () => void
  disabled?: boolean
  submitText?: string
  rows?: number
}

const onValidateJSON = (value: string) => {
  try {
    JSON.parse(value)
    return undefined
  } catch {
    return 'Invalid JSON'
  }
}

export default function JsonEditor({
  initialValue,
  onSubmit,
  onCancel,
  disabled = false,
  submitText = 'Save',
  rows = 5,
}: JsonEditorProps) {
  const form = useForm({
    mode: 'all',
    defaultValues: { json: initialValue ? JSON.stringify(initialValue, null, 2) : '' },
  })

  const isValid = !form.formState.errors.json

  const onFormatJSON = (json: string) => {
    try {
      const parsed = JSON.stringify(JSON.parse(json), null, 2)
      form.setValue('json', parsed)
      return parsed
    } catch {
      form.setError('json', {
        message: 'Invalid JSON',
      })
    }
  }

  return (
    <form className='space-y-4' onSubmit={form.handleSubmit((values) => onSubmit(JSON.parse(values.json)))}>
      <div className='relative'>
        <Textarea
          {...form.register('json', { required: 'Required field', validate: onValidateJSON })}
          placeholder='Enter JSON here...'
          disabled={disabled}
          rows={rows}
        />

        {form.formState.touchedFields.json && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='max-w-max absolute top-2 right-4'>
            <span
              className={cn(
                'text-xs flex items-center gap-1 duration-500',
                isValid ? 'text-green-500' : 'text-red-500',
              )}
            >
              {isValid ? <Check size={12} /> : <AlertCircle size={12} />}
              {isValid ? 'Valid' : 'Invalid'} JSON
            </span>
          </motion.div>
        )}
      </div>

      <div className='flex justify-end gap-2 items-center'>
        <Button variant='ghost' size='sm' onClick={() => onFormatJSON(form.getValues('json'))}>
          Format <span className='hidden md:flex'>JSON</span>
        </Button>

        {onCancel && (
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              if (onCancel) onCancel()
              return form.reset()
            }}
          >
            Cancel
          </Button>
        )}

        <Button size='sm' disabled={!isValid} type='submit' loading={form.formState.isSubmitting}>
          {submitText}
        </Button>
      </div>
    </form>
  )
}
