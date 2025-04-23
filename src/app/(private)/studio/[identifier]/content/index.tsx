'use client'

import JsonEditor from '@/components/json-editor'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Document as MongoDocument, WithId } from 'mongodb'
import { Document } from './document'

type Props = {
  activeTab: string
  onCreateDocument: (databaseName: string, collectionName: string, data: string) => Promise<unknown>
  documents: WithId<MongoDocument>[]
  totalDocuments: number
  onExecuteQuery: (databaseName: string, collectionName: string, query: string) => Promise<unknown>
  onUpdateDocument: (databaseName: string, collectionName: string, id: string, data: string) => Promise<unknown>
  onLoadMore: (databaseName: string, collectionName: string) => void
  isLoadingMoreData: boolean
}

export function Content({
  activeTab,
  onCreateDocument,
  documents,
  totalDocuments,
  onExecuteQuery,
  onUpdateDocument,
  onLoadMore,
  isLoadingMoreData,
}: Props) {
  const [selectedDatabase, selectedCollection] = activeTab.split('.')

  return (
    <div className='space-y-8'>
      {selectedCollection && (
        <section>
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
        </section>
      )}

      <hr />

      <section className='space-y-2'>
        <p className='text-sm font-normal text-muted-foreground'>
          Showing {documents.length} of {totalDocuments} document{totalDocuments < 2 ? '' : 's'}
        </p>

        {documents.map((doc) => (
          <Document key={doc._id.toString()} data={doc} activeTab={activeTab} onUpdateDocument={onUpdateDocument} />
        ))}
        {(!documents || documents.length === 0) && (
          <div className='text-center text-muted-foreground p-4'>No documents found</div>
        )}
        {totalDocuments > 0 && (
          <div className='flex items-center justify-center mt-8'>
            <Button
              loading={isLoadingMoreData}
              onClick={() => onLoadMore(selectedDatabase, selectedCollection)}
              disabled={totalDocuments <= documents.length}
            >
              Load more
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
