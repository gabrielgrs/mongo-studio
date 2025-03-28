'use client'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Code, Play, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface QueryEditorProps {
  onExecute: (query: string) => void
}

export default function QueryEditor({ onExecute }: QueryEditorProps) {
  const [query, setQuery] = useState('{ "name": "John" }')
  const [insertData, setInsertData] = useState(
    '{\n  "name": "New Document",\n  "createdAt": "2023-05-01T12:00:00Z",\n  "status": "active"\n}',
  )
  const [activeTab, setActiveTab] = useState('query')

  const handleExecute = () => {
    if (activeTab === 'query') {
      onExecute(query)
    } else {
      // In a real app, this would insert the document
      // For our mock, we'll just log it
      try {
        const parsedData = JSON.parse(insertData)
        // Add a mock _id to the document
        parsedData._id = 'temp_' + Math.random().toString(36).substring(2, 15)
        onExecute(JSON.stringify(parsedData))
      } catch (err) {
        console.error('Invalid JSON for insert', err)
        toast.error('Unable to format. Please check your JSON syntax.')
      }
    }
  }

  const formatJSON = () => {
    try {
      if (activeTab === 'query') {
        const parsed = JSON.parse(query)
        const formatted = JSON.stringify(parsed, null, 2)
        setQuery(formatted)
        toast.info('JSON Formatted')
      } else {
        const parsed = JSON.parse(insertData)
        const formatted = JSON.stringify(parsed, null, 2)
        setInsertData(formatted)
        toast.info('JSON Formatted')
      }
    } catch (err) {
      console.error('Invalid JSON', err)
      toast
    }
  }

  return (
    <div className='space-y-4'>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='w-full sm:w-auto'>
          <TabsTrigger value='query' className='flex items-center gap-1 flex-1 sm:flex-initial'>
            <Search className='h-4 w-4' />
            <span className='hidden sm:inline'>Query</span>
          </TabsTrigger>
          <TabsTrigger value='insert' className='flex items-center gap-1 flex-1 sm:flex-initial'>
            <Plus className='h-4 w-4' />
            <span className='hidden sm:inline'>Insert</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value='query' className='mt-2'>
          <div className='relative'>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Enter MongoDB query...'
              className='font-mono text-sm min-h-[100px] pr-24'
            />
            <div className='absolute bottom-2 right-2 flex gap-2'>
              <Button variant='outline' size='sm' onClick={formatJSON} className='gap-1'>
                <Code className='h-4 w-4' />
                Format JSON
              </Button>
              <Button onClick={handleExecute} size='sm' className='gap-1'>
                <Play className='h-4 w-4' />
                Execute
              </Button>
            </div>
          </div>
          <div className='text-xs text-muted-foreground mt-2'>
            <p>Example queries:</p>
            <ul className='list-disc list-inside space-y-1 mt-1'>
              <li>
                <code className='bg-muted px-1 py-0.5 rounded'>{'{ "name": "John" }'}</code> - Find documents where name
                is John
              </li>
              <li>
                <code className='bg-muted px-1 py-0.5 rounded'>{'{ "age": { "$gt": 25 } }'}</code> - Find documents
                where age is greater than 25
              </li>
            </ul>
          </div>
        </TabsContent>
        <TabsContent value='insert' className='mt-2'>
          <div className='relative'>
            <Textarea
              value={insertData}
              onChange={(e) => setInsertData(e.target.value)}
              placeholder='Enter document to insert...'
              className='font-mono text-sm min-h-[150px] pr-24'
            />
            <div className='absolute bottom-2 right-2 flex gap-2'>
              <Button variant='outline' size='sm' onClick={formatJSON} className='gap-1'>
                <Code className='h-4 w-4' />
                Format JSON
              </Button>
              <Button onClick={handleExecute} size='sm' className='gap-1'>
                <Plus className='h-4 w-4' />
                Insert
              </Button>
            </div>
          </div>
          <div className='text-xs text-muted-foreground mt-2'>
            <p>Example document to insert:</p>
            <pre className='bg-muted p-2 rounded-md mt-1 overflow-x-auto'>
              {`{
  "name": "New Product",
  "price": 49.99,
  "category": "Electronics",
  "inStock": true,
  "tags": ["new", "featured"]
}`}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
