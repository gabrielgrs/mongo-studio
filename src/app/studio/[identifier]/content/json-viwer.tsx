'use client'

import { cn } from '@/utils/cn'
import React from 'react'

type JsonViewerProps = {
  data: any
  className?: string
}

export function JsonViewer({ data, className }: JsonViewerProps) {
  return (
    <pre className={cn('overflow-auto', className)}>
      <JsonNode data={data} level={0} />
    </pre>
  )
}

type JsonNodeProps = {
  data: any | any[]
  level: number
  isKey?: boolean
}

function JsonNode({ data, level, isKey = false }: JsonNodeProps) {
  const indent = '  '.repeat(level)

  // Handle different data types
  if (data === null) {
    return <span className='text-red-400'>null</span>
  }

  if (typeof data === 'undefined') {
    return <span className='text-gray-400'>undefined</span>
  }

  if (typeof data === 'boolean') {
    return <span className='text-red-400'>{data.toString()}</span>
  }

  if (typeof data === 'number') {
    return <span className='text-orange-400'>{data}</span>
  }

  if (typeof data === 'string') {
    if (isKey) {
      return <span className='text-blue-600 dark:text-blue-500'>"{data}"</span>
    }
    return <span className='text-amber-00 dark:text-orange-400'>"{data}"</span>
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span>[]</span>
    }

    return (
      <>
        <span>[</span>
        {data.map((item, index) => (
          <React.Fragment key={index}>
            <br />
            <span>{indent} </span>
            <JsonNode data={item} level={level + 1} />
            {index < data.length - 1 && <span>,</span>}
          </React.Fragment>
        ))}
        <br />
        <span>{indent}]</span>
      </>
    )
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data)

    if (keys.length === 0) {
      return <span>{'{}'}</span>
    }

    return (
      <>
        <span>{'{'}</span>
        {keys.map((key, index) => (
          <React.Fragment key={key}>
            <br />
            <span>{indent} </span>
            <JsonNode data={key} level={level + 1} isKey={true} />
            <span>: </span>
            <JsonNode data={data[key]} level={level + 1} />
            {index < keys.length - 1 && <span>,</span>}
          </React.Fragment>
        ))}
        <br />
        <span>
          {indent}
          {'}'}
        </span>
      </>
    )
  }

  return <span>{String(data)}</span>
}
