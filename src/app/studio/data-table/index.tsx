'use client'

import { cn } from '@/utils/cn'
import { ChevronRight } from 'lucide-react'
import { Document, WithId } from 'mongodb'
import { useState } from 'react'

// const fixedColumns = ['_id', 'createdAt', 'updatedAt', '__v']

type DataType = 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function' | 'date'

function getType(value: any): DataType {
  const type = typeof value

  if (type === 'object') {
    if (value === null) return 'object'
    if (value instanceof Date) return 'date'
  }

  if (type === 'string') {
    const date = new Date(value)
    if (!isNaN(date.getTime())) return 'date'
  }

  return type as DataType
}

export function DataTable({ data: initialData }: { data: WithId<Document>[] }) {
  const [data] = useState(initialData)
  const [expandedItems, setExpandedItems] = useState<number[]>([])

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-3 gap-2'>
        <div>Key</div>
        <div>Value</div>
        <div>Type</div>
      </div>
      {data.map((item, index) => {
        const entries = Object.entries(item)

        return (
          <div key={index}>
            <button className={cn('grid grid-cols-3 gap-2 w-full', index % 2 === 0 && 'bg-muted')}>
              <p className='flex items-center'>
                <ChevronRight
                  size={20}
                  onClick={() =>
                    setExpandedItems((p) => (p.includes(index) ? p.filter((i) => i !== index) : [...p, index]))
                  }
                  className={cn('duration-500', expandedItems.includes(index) && 'rotate-90')}
                />
                {item._id.toString()}
              </p>
              <p className='text-left'>{entries.length} fields</p>
              <p className='text-left'>Document</p>
            </button>

            {expandedItems.includes(index) &&
              entries.map(([key, value], index) => {
                const dataType = getType(value)

                return (
                  <div
                    key={`${key}_${value}`}
                    className={cn('grid grid-cols-3 gap-2 py-0.5', index % 2 !== 0 && 'bg-muted')}
                  >
                    <div className='pl-6'>{key}</div>
                    <div>{String(value)}</div>
                    <div className='capitalize'>{dataType}</div>
                  </div>
                )
              })}
          </div>
        )
      })}
    </div>
  )
}
