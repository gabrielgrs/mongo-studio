'use client'

import {
  createDocument,
  getCollectionData,
  getCollections,
  removeCollection,
  removeDatabase,
  updateDocument,
} from '@/actions'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { AlignRight } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'
import { Content } from './content'
import { DatabaseList } from './database-list'

export function StudioClient({
  databases: initialDatabases,
  sessionIdentifier,
}: {
  databases: string[]
  sessionIdentifier: string
}) {
  const [showSidebar, setShowSidebar] = useState(true)
  const [databases, setDatabases] = useState(initialDatabases)
  const [activeTab, setActiveTab] = useState('')
  const [openDatabases, setOpenDatabases] = useState<Record<string, string[]>>({})
  const [loadingTab, setLoadingTab] = useState('')
  const [page, setPage] = useState(1)

  const { data: collections = [], ...getCollectionsAction } = useServerAction(getCollections)
  const createDocumentAction = useServerAction(createDocument)
  const updateDocumentAction = useServerAction(updateDocument)
  const removeDatabaseAction = useServerAction(removeDatabase)
  const removeCollectionAction = useServerAction(removeCollection)
  const getCollectionDataAction = useServerAction(getCollectionData)

  const onSelectDatabase = async (id: string, dbName: string) => {
    const tab = `${dbName}.`
    setLoadingTab(tab)
    const [res, err] = await getCollectionsAction.execute({
      database: dbName,
      identifier: id,
    })
    setLoadingTab('')
    if (err) return toast.error(err.message)
    return setOpenDatabases((prev) => ({ ...prev, [dbName]: res }))
  }
  const onSelectCollection = async (
    id: string,
    databaseName: string,
    collectionName: string,
    page: number,
    query?: string,
  ) => {
    const tab = `${databaseName}.${collectionName}`
    setLoadingTab(tab)
    const [_, err] = await getCollectionDataAction.execute({
      identifier: id,
      database: databaseName,
      collection: collectionName,
      query,
      page,
    })
    setLoadingTab('')
    if (err) return toast.error(err.message)
    setActiveTab(tab)
  }

  const onCreateDocument = async (id: string, database: string, collection: string, data: string) => {
    const [_, err] = await createDocumentAction.execute({
      identifier: sessionIdentifier,
      database,
      collection,
      data,
    })
    if (err) return toast.error(err.message)
    return onSelectCollection(id, database, collection, page)
  }

  const onRemoveCollection = async (id: string, database: string, collectionName: string) => {
    const [data, err] = await removeCollectionAction.execute({
      database,
      collectionName,
      identifier: id,
    })
    if (err) return toast.error(err.message)

    setOpenDatabases((p) => {
      const newOpenDatabases = { ...p }
      newOpenDatabases[data.database] = newOpenDatabases[data.database].filter(
        (collectionName) => collectionName !== data.collectionName,
      )
      return newOpenDatabases
    })
  }

  const onAddDatabase = (database: string, collection: string) => {
    setDatabases((p) => [...p, database])
    onSelectDatabase(sessionIdentifier, database)
    onSelectCollection(sessionIdentifier, database, collection, page)
  }

  const onRemoveDatabase = async (id: string, database: string) => {
    const [_, err] = await removeDatabaseAction.execute({
      database,
      identifier: id,
    })
    if (err) return toast.error(err.message)

    setDatabases((p) => p.filter((x) => x !== database))
    setOpenDatabases((p) => {
      const newOpenDatabases = { ...p }
      delete newOpenDatabases[database]
      return newOpenDatabases
    })
  }

  const onUpdateDocument = async (
    id: string,
    database: string,
    collection: string,
    documentId: string,
    data: string,
  ) => {
    const [_, err] = await updateDocumentAction.execute({
      identifier: id,
      database,
      collection,
      documentId,
      data,
    })
    if (err) return toast.error(err.message)
    return onSelectCollection(id, database, collection, page)
  }

  return (
    <div
      className={cn(
        'grid  duration-500 grid-cols-[max-content_auto] min-h-screen',
        showSidebar ? 'grid-cols-[max-content_auto]' : 'grid-cols-1 md:grid-cols-[max-content_auto]',
      )}
    >
      <aside
        className={cn(
          'min-w-3xs border-r fixed md:sticky top-0 left-0 w-full md:w-max backdrop-blur-2xl duration-500 z-20',
          showSidebar ? 'translate-x-0' : 'translate-x-[-100%] md:translate-x-0',
        )}
      >
        <DatabaseList
          sessionIdentifier={sessionIdentifier}
          databases={databases}
          showSidebar={showSidebar}
          onSelectDatabase={(database) => onSelectDatabase(sessionIdentifier, database)}
          openDatabases={openDatabases}
          loadingTab={loadingTab}
          onRemoveDatabase={(database) => onRemoveDatabase(sessionIdentifier, database)}
          onGetData={(database, collection) => onSelectCollection(sessionIdentifier, database, collection, page)}
          activeTab={activeTab}
          onRemoveCollection={(database, collection) => onRemoveCollection(sessionIdentifier, database, collection)}
          isRemovingDatabase={removeDatabaseAction.isPending}
          isRemovingCollection={removeCollectionAction.isPending}
          onAddDatabase={(database, collection) => onAddDatabase(database, collection)}
          onToggleSidebar={() => setShowSidebar((p) => !p)}
        />
      </aside>

      <div className='sticky top-0'>
        <header className='flex justify-start items-center sticky top-0 backdrop-blur-lg z-10 p-2 h-16 border-b'>
          <Button
            size='icon'
            variant='ghost'
            onClick={() => setShowSidebar((p) => !p)}
            className='flex md:hidden text-muted-foreground'
          >
            <AlignRight />
          </Button>
          {getCollectionDataAction.data && (
            <div>
              <p className='flex items-center gap-2'>{activeTab}</p>
              <div className='text-muted-foreground text-sm flex items-center gap-2'>
                <p>
                  Total documents: <span className='text-foreground'>{getCollectionDataAction.data.totalItems}</span>
                </p>
                <p>
                  Storage size:{' '}
                  <span className='text-foreground'>
                    {(getCollectionDataAction.data.storageSize / (1024 * 1024)).toFixed(3)}
                    Kb
                  </span>
                </p>

                <p>
                  Total indexes: <span className='text-foreground'>{getCollectionDataAction.data.totalIndexes}</span>
                </p>
              </div>
            </div>
          )}
        </header>
        <main className='p-4'>
          {getCollectionDataAction.data ? (
            <Content
              activeTab={activeTab}
              onCreateDocument={(database, collection, data) =>
                onCreateDocument(sessionIdentifier, database, collection, data)
              }
              documents={getCollectionDataAction.data.documents}
              onExecuteQuery={(database, collection, query) =>
                onSelectCollection(sessionIdentifier, database, collection, page, query)
              }
              onUpdateDocument={(database, collection, id, data) =>
                onUpdateDocument(sessionIdentifier, database, collection, id, data)
              }
              onLoadMore={(database, collection) => {
                setPage((p) => p + 1)
                onSelectCollection(sessionIdentifier, database, collection, page + 1)
              }}
              isLoadingMoreData={getCollectionDataAction.isPending && getCollectionDataAction.data?.totalItems > 0}
              totalDocuments={getCollectionDataAction.data.totalItems}
            />
          ) : (
            <div className='flex items-center justify-center text-muted-foreground'>
              Select a collection from the sidebar to view documents
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
