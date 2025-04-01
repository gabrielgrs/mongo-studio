'use client'

import JsonEditor from '@/components/json-editor'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { WithId } from 'mongodb'
import { useState } from 'react'
import 'react18-json-view/src/style.css'
import { JsonViewer } from './json-viwer'

type Props = {
  activeTab: string
  onUpdateDocument: (databaseName: string, collectionName: string, id: string, data: string) => Promise<unknown>
  data: WithId<string>
}

export function Document({ activeTab, onUpdateDocument, data }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const identifier = data._id.toString()

  const [selectedDatabase, selectedCollection] = activeTab.split('.')

  return (
    <div key={identifier} className='border rounded-md'>
      <button
        onClick={() => {
          setIsExpanded((p) => !p)
          setIsEditing(false)
        }}
        className={cn(
          `w-full flex items-center justify-between p-3 text-sm hover:bg-foreground/10`,
          isExpanded ? 'bg-foreground/10' : '',
        )}
      >
        <div>{JSON.stringify({ id: data._id.toString() })}</div>
        <ChevronRight size={20} className={cn('duration-500', isExpanded && 'rotate-90')} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className='p-3 bg-muted/30'>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className='relative'
              >
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsEditing(true)}
                  className='absolute right-1 top-1'
                >
                  Edit
                </Button>
                {isEditing ? (
                  <JsonEditor
                    initialValue={data}
                    onSubmit={(values) =>
                      onUpdateDocument(selectedDatabase, selectedCollection, JSON.stringify(values), identifier)
                    }
                    onCancel={() => setIsEditing(false)}
                    rows={Object.keys(data).length + 2}
                    // onChange={setSelectedDocumentToEdit}
                  />
                ) : (
                  // <pre className='whitespace-pre-wrap break-all rounded-md max-w-full overflow-x-auto p-2'>
                  //   {JSON.stringify(data, null, 2)}
                  // </pre>
                  <JsonViewer data={data} />
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
