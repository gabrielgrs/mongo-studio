'use client'

import {
  createDocument,
  getCollectionData,
  getCollections,
  removeCollection,
  removeDatabase,
  updateDocument,
} from '@/actions'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { LogOut, SidebarIcon } from 'lucide-react'
import { WithId } from 'mongodb'
import { useState } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'
import { Main } from './main'
import { Sidebar } from './sidebar'

type CollectionWithIdentifier = Record<string, { totalItems: number; data: WithId<any>[] }>

export function StudioClient({
  databases: initialDatabases,
  sessionIdentifier,
}: { databases: string[]; sessionIdentifier: string }) {
  const [showSidebar, setShowSidebar] = useState(false)
  const [databases, setDatabases] = useState(initialDatabases)
  const [activeTab, setActiveTab] = useState('')
  const [openDatabases, setOpenDatabases] = useState<Record<string, string[]>>({})
  const [openCollectionsWithIdentifiers, setOpenCollectionsWithIdentifiers] = useState<CollectionWithIdentifier>({})
  const [tabsLoading, setTabsLoading] = useState<string[]>([])
  const [page, setPage] = useState(1)

  const { data: collections = [], ...getCollectionsAction } = useServerAction(getCollections)
  const createDocumentAction = useServerAction(createDocument)
  const updateDocumentAction = useServerAction(updateDocument)
  const removeDatabaseAction = useServerAction(removeDatabase)
  const removeCollectionAction = useServerAction(removeCollection)
  const getCollectionDataAction = useServerAction(getCollectionData)

  const tabs = Object.keys(openCollectionsWithIdentifiers)
  // const [selectedDatabase, selectedCollection] = activeTab.split('.')
  const documentsToShow = openCollectionsWithIdentifiers[activeTab]?.data
  const totalDocuments = openCollectionsWithIdentifiers[activeTab]?.totalItems ?? -1

  const onSelectDatabase = async (id: string, dbName: string) => {
    const tab = `${dbName}.`
    setTabsLoading((p) => [...p, tab])
    const [res, err] = await getCollectionsAction.execute({
      database: dbName,
      identifier: id,
    })
    setTabsLoading((p) => p.filter((t) => t !== tab))
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
    setTabsLoading((p) => [...p, tab])
    const [res, err] = await getCollectionDataAction.execute({
      identifier: id,
      database: databaseName,
      collection: collectionName,
      query,
      page,
    })
    setTabsLoading((p) => p.filter((t) => t !== tab))
    if (err) return toast.error(err.message)
    setShowSidebar(false)
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

  const onRemoveDatabase = async (id: string, databaseName: string) => {
    const [data, err] = await removeDatabaseAction.execute({ databaseName, identifier: id })
    if (err) return toast.error(err.message)

    setDatabases((p) => p.filter((x) => x !== data.databaseName))
    setOpenDatabases((p) => {
      const newOpenDatabases = { ...p }
      delete newOpenDatabases[data.databaseName]
      return newOpenDatabases
    })
    setOpenCollectionsWithIdentifiers((p) => {
      const newOpenCollectionsWithIdentifiers = { ...p }
      const identifiers = Object.keys(newOpenCollectionsWithIdentifiers).filter((item) =>
        item.includes(data.databaseName),
      )
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
    <div className='grid grid-cols-[max-content_auto] gap-2 overflow-x-hidden'>
      <Sidebar
        databases={databases}
        showSidebar={showSidebar}
        onSelectDatabase={(database) => onSelectDatabase(sessionIdentifier, database)}
        openDatabases={openDatabases}
        tabsLoading={tabsLoading}
        onRemoveDatabase={(database) => onRemoveDatabase(sessionIdentifier, database)}
        onGetData={(database, collection) => onSelectCollection(sessionIdentifier, database, collection, page)}
        activeTab={activeTab}
        onRemoveCollection={(database, collection) => onRemoveCollection(sessionIdentifier, database, collection)}
        isRemovingDatabase={removeDatabaseAction.isPending}
        isRemovingCollection={removeCollectionAction.isPending}
      />

      <div className='bg-card min-h-screen rounded-tl-2xl p-2'>
        <div className='flex items-center gap-2 absolute right-0 top-0 bg-background rounded-bl-2xl p-2'>
          <ThemeToggle />

          <Button
            variant='outline'
            size='icon'
            onClick={() => window.location.reload()}
            title='Disconnect'
            className='h-8 w-8'
          >
            <LogOut size={18} />
          </Button>
        </div>

        <Button size='icon' variant='ghost' onClick={() => setShowSidebar((p) => !p)} className='relative sm:hidden'>
          <SidebarIcon size={18} />
        </Button>

        <Main
          activeTab={activeTab}
          tabs={tabs}
          onSelectTab={(tab) => setActiveTab(tab)}
          tabsLoading={tabsLoading}
          onCloseTab={onCloseTab}
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
      </div>
    </div>
  )
}
