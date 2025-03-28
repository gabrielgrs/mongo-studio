'use client'

import type React from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import { AlertCircle, Check } from 'lucide-react'
import { useEffect, useState } from 'react'

interface JsonEditorProps {
  value: any
  onChange: (value: any) => void
  readOnly?: boolean
}

export default function JsonEditor({ value, onChange, readOnly = false }: JsonEditorProps) {
  const [jsonString, setJsonString] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(true)

  // Update the text area when the value changes
  useEffect(() => {
    try {
      const formatted = JSON.stringify(value, null, 2)
      setJsonString(formatted)
      setError(null)
      setIsValid(true)
    } catch {
      setError('Invalid JSON object')
      setIsValid(false)
    }
  }, [value])

  // Handle text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setJsonString(text)

    try {
      const parsed = JSON.parse(text)
      onChange(parsed)
      setError(null)
      setIsValid(true)
    } catch {
      setError('Invalid JSON syntax')
      setIsValid(false)
    }
  }

  // Format the JSON
  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonString)
      const formatted = JSON.stringify(parsed, null, 2)
      setJsonString(formatted)
      onChange(parsed)
      setError(null)
      setIsValid(true)
    } catch {
      setError('Cannot format invalid JSON')
    }
  }

  return (
    <div className='space-y-4'>
      <div className='relative'>
        <Textarea
          value={jsonString}
          onChange={handleTextChange}
          className='font-mono text-sm min-h-[200px] resize-y'
          placeholder='Enter JSON here...'
          readOnly={readOnly}
        />

        {!readOnly && (
          <div className='absolute top-2 right-2 flex gap-2'>
            <Button variant='outline' size='sm' onClick={handleFormat} disabled={!isValid} className='h-7 px-2 text-xs'>
              Format JSON
            </Button>
          </div>
        )}

        {isValid && !error && !readOnly && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='absolute bottom-2 right-2'>
            <div className='bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-md flex items-center gap-1'>
              <Check className='h-3 w-3' />
              Valid JSON
            </div>
          </motion.div>
        )}
      </div>

      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
