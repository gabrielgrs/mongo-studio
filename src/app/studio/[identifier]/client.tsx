'use client'

import {
  createDocument,
  getCollectionData,
  getCollections,
  removeCollection,
  removeDatabase,
  updateDocument,
} from '@/actions/mongodb'
import { AreYouSure } from '@/components/are-you-sure'
import JsonEditor from '@/components/json-editor'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/utils/cn'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Loader2, LogOut, Menu, Trash, X } from 'lucide-react'
import { WithId } from 'mongodb'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 },
  },
}

type CollectionWithIdentifier = Record<string, { totalItems: number; data: WithId<any>[] }>

export function StudioClient({ databases: initialDatabases, identifier }: { databases: string[]; identifier: string }) {
  const [databases, setDatabases] = useState(initialDatabases)
  const [selectedDocumentToEdit, setSelectedDocumentToEdit] = useState('')
  const [activeTab, setActiveTab] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [openDatabases, setOpenDatabases] = useState<Record<string, string[]>>({})
  const [openCollectionsWithIdentifiers, setOpenCollectionsWithIdentifiers] = useState<CollectionWithIdentifier>({})
  const [expandedDocuments, setExpandedDocuments] = useState<string[]>([])
  const [tabsLoading, setTabsLoading] = useState<string[]>([])

  // const { data: databases = [], ...getDatabasesAction } = useServerAction(getDatabases)
  const { data: collections = [], ...getCollectionsAction } = useServerAction(getCollections)
  const createDocumentAction = useServerAction(createDocument)
  const updateDocumentAction = useServerAction(updateDocument)
  const removeDatabaseAction = useServerAction(removeDatabase, {
    onSuccess: ({ data }) => {
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
    },
  })
  const removeCollectionAction = useServerAction(removeCollection, {
    onSuccess: ({ data }) => {
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
    },
  })

  const getCollectionDataAction = useServerAction(getCollectionData)

  const tabs = Object.keys(openCollectionsWithIdentifiers)
  const [selectedDatabase, selectedCollection] = activeTab.split('.')
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
  const onGetCollectionData = async (id: string, databaseName: string, collectionName: string, query?: string) => {
    const tab = `${databaseName}.${collectionName}`
    setTabsLoading((p) => [...p, tab])
    const [res, err] = await getCollectionDataAction.execute({
      identifier: id,
      database: databaseName,
      collection: collectionName,
      query,
      page: 1,
    })
    setTabsLoading((p) => p.filter((t) => t !== tab))
    if (err) return toast.error(err.message)
    setIsSidebarOpen(false)
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

  const onSelectDocument = (documentId: string) => {
    setExpandedDocuments((p) => (p.includes(documentId) ? p.filter((id) => id !== documentId) : [...p, documentId]))
  }

  const onCreateDocument = async (id: string, database: string, collection: string, data: string) => {
    const [_, err] = await createDocumentAction.execute({ identifier, database, collection, data })
    if (err) return toast.error(err.message)
    return onGetCollectionData(id, database, collection)
  }

  const renderSidebarContent = () => (
    <div className='h-full flex flex-col'>
      <div className='p-4 pr-0 flex justify-between items-center'>
        <h2 className='text-lg font-semibold flex items-center gap-2'>
          <Image src='/logo.svg' width={24} height={24} alt='Mongo Studio logo' />
          Mongo Studio
        </h2>
        <ThemeToggle />

        <Button variant='outline' size='icon' onClick={() => window.location.reload()} title='Disconnect'>
          <LogOut size={16} />
        </Button>
      </div>
      <Separator />
      <ScrollArea className='flex-1'>
        <div className='p-2'>
          {databases.map((databaseName) => (
            <div key={databaseName}>
              <div className='flex items-center gap-1'>
                <button
                  onClick={() => onSelectDatabase(identifier, databaseName)}
                  className='w-full flex items-center gap-1 p-2 hover:bg-card rounded-md text-left text-sm relative'
                >
                  <ChevronRight
                    size={16}
                    className={cn('text-muted-foreground duration-500', openDatabases[databaseName] && 'rotate-90')}
                  />

                  <span className='whitespace-nowrap'>{databaseName}</span>
                  <div className='absolute right-2 top-[50%] translate-y-[-50%] z-50'>
                    {tabsLoading.includes(`${databaseName}.`) && (
                      <Loader2 size={14} className='animate-spin text-muted-foreground' />
                    )}
                  </div>
                </button>

                {openDatabases[databaseName] && (
                  <AreYouSure
                    confirmationText={databaseName}
                    onConfirm={() => removeDatabaseAction.execute({ identifier, databaseName })}
                    loading={removeDatabaseAction.isPending}
                  >
                    <Button
                      size='icon'
                      variant='ghost'
                      className='text-muted-foreground hover:text-destructive duration-500'
                    >
                      <Trash role='button' size={14} />
                    </Button>
                  </AreYouSure>
                )}
              </div>

              <AnimatePresence>
                {openDatabases[databaseName] && (
                  <div className='pr-1'>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className='ml-4 pl-1 border-l py-1'
                    >
                      {openDatabases[databaseName].map((collectionName) => {
                        const isActive = activeTab === `${databaseName}.${collectionName}`
                        return (
                          <div key={collectionName} className='flex items-center gap-1'>
                            <motion.button
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              onClick={() => onGetCollectionData(identifier, databaseName, collectionName)}
                              className={cn(
                                'w-full text-left p-2 text-sm relative flex items-center gap-2 hover:text-primary',
                                !isActive && 'text-muted-foreground',
                              )}
                            >
                              {isActive && (
                                <motion.div
                                  layoutId='collection_active'
                                  className='absolute left-0 top-0 w-full h-full bg-foreground/5 rounded-md'
                                />
                              )}
                              {collectionName}
                              {tabsLoading.includes(`${databaseName}.${collectionName}`) && (
                                <Loader2 size={14} className='animate-spin text-muted-foreground' />
                              )}
                            </motion.button>
                            <AreYouSure
                              confirmationText={collectionName}
                              onConfirm={() =>
                                removeCollectionAction.execute({
                                  identifier,
                                  database: databaseName,
                                  collectionName,
                                })
                              }
                              loading={removeCollectionAction.isPending}
                            >
                              <Button
                                size='icon'
                                variant='ghost'
                                className='text-muted-foreground hover:text-destructive duration-500'
                              >
                                <Trash role='button' size={14} />
                              </Button>
                            </AreYouSure>
                          </div>
                        )
                      })}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <>
      <AnimatePresence mode='wait'>
        {databases.length > 0 && (
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <div className='px-4 pt-1 flex h-20 items-center justify-between gap-2 md:hidden'>
                <div className='flex items-center gap-2'>
                  <Button variant='ghost' size='icon'>
                    <Menu size={20} />
                  </Button>

                  <h2 className='text-lg font-semibold flex items-center gap-2'>
                    <Image src='/logo.svg' width={24} height={24} alt='Mongo Studio logo' />
                    Mongo Studio
                  </h2>
                </div>

                <div className='flex items-center gap-2'>
                  <ThemeToggle />

                  <Button variant='outline' size='icon' onClick={() => window.location.reload()} title='Disconnect'>
                    <LogOut size={16} />
                  </Button>
                </div>
              </div>
            </SheetTrigger>
            <SheetContent side='left' className='w-[280px] p-0' hideClose>
              <SheetTitle></SheetTitle>
              {renderSidebarContent()}
            </SheetContent>
          </Sheet>
        )}
        <motion.div
          key='admin-interface'
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          className='grid grid-cols-1 md:grid-cols-[280px_1fr] items-start min-h-screen'
        >
          <motion.div variants={itemVariants} className='hidden md:flex sticky top-0 flex-col justify-between pb-8'>
            {renderSidebarContent()}
          </motion.div>

          <motion.div variants={itemVariants} className='space-y-4 p-4'>
            {tabs.length > 0 && (
              <div className='flex flex-wrap overflow-x-auto border-b sticky top-0 z-10 backdrop-blur-lg'>
                {tabs.map((tabIdentifier) => (
                  <button
                    key={tabIdentifier}
                    onClick={() => setActiveTab(tabIdentifier)}
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

            <main className='bg-card border shadow px-4 py-6 rounded-lg min-h-max'>
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
                          onGetCollectionData(identifier, selectedDatabase, selectedCollection, JSON.stringify(values))
                        }}
                      />
                    </TabsContent>

                    <TabsContent value='insert' className='p-2'>
                      <JsonEditor
                        initialValue={{ name: 'John' }}
                        submitText='Insert'
                        onSubmit={(values) => {
                          onCreateDocument(identifier, selectedDatabase, selectedCollection, JSON.stringify(values))
                        }}
                      />
                    </TabsContent>
                  </Tabs>
                </>
              )}

              {documentsToShow ? (
                <span className='flex items-center gap-1'>
                  {selectedDatabase}.{selectedCollection}
                  <span className='text-sm font-normal text-muted-foreground'>
                    ({documentsToShow.length} of {totalDocuments} document{totalDocuments < 2 ? '' : 's'})
                  </span>
                </span>
              ) : (
                'Select a collection'
              )}

              {documentsToShow ? (
                <div className='space-y-2'>
                  {documentsToShow.map((doc) => (
                    <div key={doc._id} className='border rounded-md'>
                      <button
                        onClick={() => onSelectDocument(doc._id)}
                        className={`w-full flex items-center justify-between p-3 text-sm hover:bg-foreground/10 ${
                          expandedDocuments.includes(doc._id) ? 'bg-foreground/10' : ''
                        }`}
                      >
                        <div className='font-mono text-xs truncate flex-1 text-left'>
                          {JSON.stringify(doc).substring(0, 60)}...
                        </div>
                        <ChevronRight
                          size={20}
                          className={cn('duration-500', expandedDocuments.includes(doc._id) && 'rotate-90')}
                        />
                      </button>

                      <AnimatePresence>
                        {expandedDocuments.includes(doc._id) && (
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
                                  onClick={() => setSelectedDocumentToEdit(doc._id)}
                                  className='absolute right-1 top-1'
                                >
                                  Edit
                                </Button>
                                {selectedDocumentToEdit === doc._id ? (
                                  <JsonEditor
                                    initialValue={doc}
                                    onSubmit={(values) =>
                                      updateDocumentAction.execute({
                                        identifier,
                                        database: selectedDatabase,
                                        collection: selectedCollection,
                                        data: JSON.stringify(values),
                                        documentId: doc._id,
                                      })
                                    }
                                    onCancel={() => setSelectedDocumentToEdit('')}
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
                </div>
              ) : (
                <div className='flex items-center justify-center text-muted-foreground'>
                  Select a collection from the sidebar to view documents
                </div>
              )}
            </main>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
