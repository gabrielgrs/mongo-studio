'use client'

import JsonEditor from '@/components/json-editor'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/utils/cn'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Loader2, X } from 'lucide-react'
import { WithId } from 'mongodb'
import { useState } from 'react'

type Props = {
  tabs: string[]
  activeTab: string
  onSelectTab: (tabName: string) => void
  onCloseTab: (tabName: string) => void
  tabsLoading: string[]
  onCreateDocument: (databaseName: string, collectionName: string, data: string) => Promise<unknown>
  documentsToShow: WithId<string>[]
  totalDocuments: number
  onExecuteQuery: (databaseName: string, collectionName: string, query: string) => Promise<unknown>
  onUpdateDocument: (databaseName: string, collectionName: string, id: string, data: string) => Promise<unknown>
  onLoadMore: (databaseName: string, collectionName: string) => void
  isLoadingMoreData: boolean
}

export function Main({
  tabs,
  activeTab,
  onSelectTab,
  tabsLoading,
  onCloseTab,
  onCreateDocument,
  documentsToShow,
  totalDocuments,
  onExecuteQuery,
  onUpdateDocument,
  onLoadMore,
  isLoadingMoreData,
}: Props) {
  const [documentsToEdit, setDocumentsToEdit] = useState<string>('')
  const [expandedDocuments, setExpandedDocuments] = useState<string[]>([])
  const [selectedDatabase, selectedCollection] = activeTab.split('.')

  return (
    <div className='mt-14 space-y-8 px-4'>
      {tabs.length > 0 && (
        <div className='flex flex-wrap overflow-x-auto border-b sticky top-0 z-10 backdrop-blur-lg'>
          {tabs.map((tabIdentifier) => (
            <button
              key={tabIdentifier}
              onClick={() => onSelectTab(tabIdentifier)}
              className={cn(
                `flex items-center gap-2 px-3 py-4 whitespace-nowrap relative duration-500`,
                activeTab !== tabIdentifier && 'text-muted-foreground',
              )}
            >
              {activeTab === tabIdentifier && (
                <motion.div layoutId='tab_active' className='absolute left-0 bottom-0 w-full h-0.5 bg-primary' />
              )}
              <span className='text-sm font-medium truncate max-w-[120px] sm:max-w-none'>{tabIdentifier}</span>

              {tabsLoading.includes(tabIdentifier) ? (
                <Loader2 size={14} className='animate-spin text-muted-foreground' />
              ) : (
                <X
                  role='button'
                  size={14}
                  className='text-muted-foreground hover:text-primary'
                  onClick={() => onCloseTab(tabIdentifier)}
                />
              )}
            </button>
          ))}
        </div>
      )}

      <main>
        {tabs.length > 0 && selectedCollection && (
          <>
            <h2>Query & Insert</h2>
            <p className='text-muted-foreground'>Execute MongoDB queries or insert new documents</p>
            <Tabs defaultValue='query' className='w-full'>
              <TabsList className='mt-2'>
                <TabsTrigger value='query'>Query</TabsTrigger>
                <TabsTrigger value='insert'>Insert</TabsTrigger>
              </TabsList>
              <TabsContent value='query'>
                <JsonEditor
                  initialValue={{ name: 'John' }}
                  submitText='Execute'
                  onSubmit={(values) => {
                    onExecuteQuery(selectedDatabase, selectedCollection, JSON.stringify(values))
                  }}
                />
              </TabsContent>

              <TabsContent value='insert'>
                <JsonEditor
                  initialValue={{ name: 'John' }}
                  submitText='Insert'
                  onSubmit={(values) => {
                    onCreateDocument(selectedDatabase, selectedCollection, JSON.stringify(values))
                  }}
                />
              </TabsContent>
            </Tabs>
          </>
        )}

        {documentsToShow && (
          <span className='flex items-center gap-1'>
            {selectedDatabase}.{selectedCollection}
            <span className='text-sm font-normal text-muted-foreground'>
              ({documentsToShow.length} of {totalDocuments} document{totalDocuments < 2 ? '' : 's'})
            </span>
          </span>
        )}

        {documentsToShow ? (
          <div className='space-y-2'>
            {documentsToShow.map((doc) => (
              <div key={doc._id.toString()} className='border rounded-md'>
                <button
                  onClick={() =>
                    setExpandedDocuments((p) =>
                      p.includes(doc._id.toString())
                        ? p.filter((id) => id !== doc._id.toString())
                        : [...p, doc._id.toString()],
                    )
                  }
                  className={`w-full flex items-center justify-between p-3 text-sm hover:bg-foreground/10 ${
                    expandedDocuments.includes(doc._id.toString()) ? 'bg-foreground/10' : ''
                  }`}
                >
                  <div className='font-mono text-xs truncate flex-1 text-left'>
                    {JSON.stringify(doc).substring(0, 60)}...
                  </div>
                  <ChevronRight
                    size={20}
                    className={cn('duration-500', expandedDocuments.includes(doc._id.toString()) && 'rotate-90')}
                  />
                </button>

                <AnimatePresence>
                  {expandedDocuments.includes(doc._id.toString()) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className='border-t'
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
                            onClick={() => setDocumentsToEdit(doc._id.toString())}
                            className='absolute right-1 top-1'
                          >
                            Edit
                          </Button>
                          {documentsToEdit === doc._id.toString() ? (
                            <JsonEditor
                              initialValue={doc}
                              onSubmit={(values) =>
                                onUpdateDocument(
                                  selectedDatabase,
                                  selectedCollection,
                                  JSON.stringify(values),
                                  doc._id.toString(),
                                )
                              }
                              onCancel={() => setDocumentsToEdit('')}
                              rows={Object.keys(doc).length + 2}
                              // onChange={setSelectedDocumentToEdit}
                            />
                          ) : (
                            <pre className='text-xs font-mono whitespace-pre-wrap bg-muted p-3 rounded-md overflow-auto'>
                              {JSON.stringify(doc, null, 2)}
                            </pre>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            {(!documentsToShow || documentsToShow.length === 0) && (
              <div className='text-center text-muted-foreground p-4'>No documents found</div>
            )}
            {totalDocuments > 0 && (
              <div className='flex items-center justify-center mt-8'>
                <Button
                  loading={isLoadingMoreData}
                  onClick={() => onLoadMore(selectedDatabase, selectedCollection)}
                  disabled={totalDocuments <= documentsToShow.length}
                >
                  Load more
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className='flex items-center justify-center text-muted-foreground'>
            Select a collection from the sidebar to view documents
          </div>
        )}
      </main>
    </div>
  )
}
