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
import { WithId } from 'mongodb'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'
import { Content } from './content'
import { DatabaseList } from './database-list'
import { Tabs } from './tabs'

type CollectionWithIdentifier = Record<string, { totalItems: number; data: WithId<any>[] }>

export function StudioClient({
  databases: initialDatabases,
  sessionIdentifier,
}: { databases: string[]; sessionIdentifier: string }) {
  const ref = useRef<HTMLElement>(null)

  const [showSidebar, setShowSidebar] = useState(true)
  const [databases, setDatabases] = useState(initialDatabases)
  const [activeTab, setActiveTab] = useState('')
  const [openDatabases, setOpenDatabases] = useState<Record<string, string[]>>({})
  const [openCollectionsWithIdentifiers, setOpenCollectionsWithIdentifiers] = useState<CollectionWithIdentifier>({})
  const [loadingTab, setLoadingTab] = useState('')
  const [page, setPage] = useState(1)

  const { data: collections = [], ...getCollectionsAction } = useServerAction(getCollections)
  const createDocumentAction = useServerAction(createDocument)
  const updateDocumentAction = useServerAction(updateDocument)
  const removeDatabaseAction = useServerAction(removeDatabase)
  const removeCollectionAction = useServerAction(removeCollection)
  const getCollectionDataAction = useServerAction(getCollectionData)

  const tabs = Object.keys(openCollectionsWithIdentifiers)
  const documentsToShow = openCollectionsWithIdentifiers[activeTab]?.data
  const totalDocuments = openCollectionsWithIdentifiers[activeTab]?.totalItems ?? -1

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        if (window.innerWidth < 768) setShowSidebar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
    const [res, err] = await getCollectionDataAction.execute({
      identifier: id,
      database: databaseName,
      collection: collectionName,
      query,
      page,
    })
    setLoadingTab('')
    if (err) return toast.error(err.message)
    setOpenCollectionsWithIdentifiers((p) => ({
      ...p,
      [tab]: { totalItems: res.totalItems, data: res.data },
    }))
    setActiveTab(tab)
  }

  const onCloseTab = (tabIdentifier: string) => {
    const tabIndex = tabs.filter((tab) => tab !== tabIdentifier).findIndex((tab) => tab === tabIdentifier)
    const t = tabIndex > 0 ? tabs[tabIndex] : tabs[0]
    setActiveTab(t)

    setOpenCollectionsWithIdentifiers((prev) => {
      const newData = { ...prev }
      delete newData[tabIdentifier]
      return newData
    })
  }

  const onCreateDocument = async (id: string, database: string, collection: string, data: string) => {
    const [_, err] = await createDocumentAction.execute({ identifier: sessionIdentifier, database, collection, data })
    if (err) return toast.error(err.message)
    return onSelectCollection(id, database, collection, page)
  }

  const onRemoveCollection = async (id: string, database: string, collectionName: string) => {
    const [data, err] = await removeCollectionAction.execute({ database, collectionName, identifier: id })
    if (err) return toast.error(err.message)

    setOpenCollectionsWithIdentifiers((p) => {
      const newOpenCollectionsWithIdentifiers = { ...p }
      delete newOpenCollectionsWithIdentifiers[`${data.database}.${data.collectionName}`]
      return newOpenCollectionsWithIdentifiers
    })
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
    const [_, err] = await removeDatabaseAction.execute({ database, identifier: id })
    if (err) return toast.error(err.message)

    setDatabases((p) => p.filter((x) => x !== database))
    setOpenDatabases((p) => {
      const newOpenDatabases = { ...p }
      delete newOpenDatabases[database]
      return newOpenDatabases
    })
    setOpenCollectionsWithIdentifiers((p) => {
      const newOpenCollectionsWithIdentifiers = { ...p }
      const identifiers = Object.keys(newOpenCollectionsWithIdentifiers).filter((item) => item.includes(database))
      identifiers.forEach((item) => delete newOpenCollectionsWithIdentifiers[item])
      return newOpenCollectionsWithIdentifiers
    })
  }

  const onUpdateDocument = async (
    id: string,
    database: string,
    collection: string,
    documentId: string,
    data: string,
  ) => {
    const [_, err] = await updateDocumentAction.execute({ identifier: id, database, collection, documentId, data })
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
          'min-w-3xs border-r fixed md:sticky top-0 left-0 w-full md:w-max backdrop-blur-2xl duration-500 z-20 h-screen',
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
        <header className='flex justify-start items-start sticky top-0 backdrop-blur-lg z-10'>
          <div className='py-2'>
            <Button
              size='icon'
              variant='ghost'
              onClick={() => setShowSidebar((p) => !p)}
              className='flex md:hidden text-muted-foreground'
            >
              <AlignRight />
            </Button>
          </div>
          <Tabs
            tabs={tabs}
            onSelectTab={(tab) => setActiveTab(tab)}
            loadingTab={loadingTab}
            onCloseTab={onCloseTab}
            activeTab={activeTab}
          />
        </header>
        <main className='px-2 py-4'>
          <Content
            tabs={tabs}
            activeTab={activeTab}
            onCreateDocument={(database, collection, data) =>
              onCreateDocument(sessionIdentifier, database, collection, data)
            }
            documentsToShow={documentsToShow}
            totalDocuments={totalDocuments}
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
            isLoadingMoreData={getCollectionDataAction.isPending && totalDocuments > 0}
          />
        </main>
      </div>
    </div>
  )
}
