'use client'

import JsonEditor from '@/components/json-editor'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WithId } from 'mongodb'
import { Document } from './document'

type Props = {
  tabs: string[]
  activeTab: string
  onCreateDocument: (databaseName: string, collectionName: string, data: string) => Promise<unknown>
  documentsToShow: WithId<string>[]
  totalDocuments: number
  onExecuteQuery: (databaseName: string, collectionName: string, query: string) => Promise<unknown>
  onUpdateDocument: (databaseName: string, collectionName: string, id: string, data: string) => Promise<unknown>
  onLoadMore: (databaseName: string, collectionName: string) => void
  isLoadingMoreData: boolean
}

export function Content({
  tabs,
  activeTab,
  onCreateDocument,
  documentsToShow,
  totalDocuments,
  onExecuteQuery,
  onUpdateDocument,
  onLoadMore,
  isLoadingMoreData,
}: Props) {
  const [selectedDatabase, selectedCollection] = activeTab.split('.')

  return (
    <div className='space-y-8'>
      <div className='space-y-2'>
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
          <span className='flex flex-col md:flex-row  items-start md:items-center gap-1'>
            {selectedDatabase}.{selectedCollection}
            <span className='text-sm font-normal text-muted-foreground'>
              ({documentsToShow.length} of {totalDocuments} document{totalDocuments < 2 ? '' : 's'})
            </span>
          </span>
        )}

        {documentsToShow ? (
          <div className='space-y-2'>
            {documentsToShow.map((doc) => (
              <Document key={doc._id.toString()} data={doc} activeTab={activeTab} onUpdateDocument={onUpdateDocument} />
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
      </div>
    </div>
  )
}
