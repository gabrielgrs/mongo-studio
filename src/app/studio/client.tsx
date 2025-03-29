'use client'

import {
  createDocument,
  getCollectionData,
  getCollections,
  getDatabases,
  queryDocuments,
  updateDocument,
} from '@/actions/mongodb'
import JsonEditor from '@/components/json-editor'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/utils/cn'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Database, Menu, PlusCircle, RefreshCw, X } from 'lucide-react'
import { WithId } from 'mongodb'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'
import { ThemeToggle } from './theme-toggle'

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

export function StudioClient() {
  const [selectedDocumentToEdit, setSelectedDocumentToEdit] = useState('')
  const [activeTab, setActiveTab] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [cachedDatabases, setCachedDatabases] = useState<Record<string, string[]>>({})
  const [cachedData, setCachedData] = useState<Record<string, { totalItems: number; data: WithId<any>[] }>>({})
  const [expandedDocuments, setExpandedDocuments] = useState<string[]>([])

  const connectionForm = useForm({ defaultValues: { uri: '' } })

  const { data: databases = [], ...getDatabasesAction } = useServerAction(getDatabases)
  const { data: collections = [], ...getCollectionsAction } = useServerAction(getCollections)
  const createDocumentAction = useServerAction(createDocument)
  const updateDocumentAction = useServerAction(updateDocument)
  const queryDocumentsAction = useServerAction(queryDocuments)

  const getCollectionDataAction = useServerAction(getCollectionData)

  const isConnected = databases.length > 0
  const databaseUri = useWatch({ control: connectionForm.control, name: 'uri' })
  const tabs = Object.keys(cachedData)
  const [selectedDatabase, selectedCollection] = activeTab.split('.')
  const documentsToShow = cachedData[activeTab]?.data
  const totalDocuments = cachedData[activeTab]?.totalItems ?? -1

  const onSelectDatabase = async (dbName: string) => {
    const [res, err] = await getCollectionsAction.execute({ database: dbName, uri: connectionForm.getValues('uri') })
    if (err) return toast.error(err.message)
    return setCachedDatabases((prev) => ({ ...prev, [dbName]: res }))
  }
  const onSelectCollection = async (databaseUri: string, databaseName: string, collectionName: string) => {
    const [res, err] = await getCollectionDataAction.execute({
      uri: databaseUri,
      database: databaseName,
      collection: collectionName,
      page: 1,
    })
    if (err) return toast.error(err.message)
    setCachedData((p) => ({
      ...p,
      [`${databaseName}.${collectionName}`]: { totalItems: res.totalItems, data: res.data },
    }))
    setActiveTab(`${databaseName}.${collectionName}`)
  }

  const onCloseTab = (tabIdentifier: string) => {
    const tabIndex = tabs.filter((tab) => tab !== tabIdentifier).findIndex((tab) => tab === tabIdentifier)
    const t = tabIndex > 0 ? tabs[tabIndex] : tabs[0]
    setActiveTab(t)

    setCachedData((prev) => {
      const newData = { ...prev }
      delete newData[tabIdentifier]
      return newData
    })
  }

  const onSelectDocument = (documentId: string) => {
    setExpandedDocuments((p) => (p.includes(documentId) ? p.filter((id) => id !== documentId) : [...p, documentId]))
  }

  // Render the sidebar content
  const renderSidebarContent = () => (
    <div className='h-full flex flex-col'>
      <div className='p-4 flex justify-between items-center'>
        <h2 className='text-lg font-semibold flex items-center gap-2'>
          <Database className='h-5 w-5 text-primary' />
          Databases
        </h2>
        <Button
          variant='outline'
          size='icon'
          onClick={() => getDatabasesAction.execute(connectionForm.getValues('uri'))}
          title='Disconnect'
        >
          <RefreshCw className='h-4 w-4' />
        </Button>
      </div>
      <Separator />
      <ScrollArea className='flex-1'>
        <div className='p-2'>
          {databases.map((databaseName) => (
            <div key={databaseName} className='mb-1'>
              <button
                onClick={() => onSelectDatabase(databaseName)}
                className='w-full flex items-center gap-1 p-2 hover:bg-accent rounded-md text-left text-sm'
              >
                <ChevronRight
                  size={16}
                  className={cn('text-muted-foreground duration-500', cachedDatabases[databaseName] && 'rotate-90')}
                />

                <span>{databaseName}</span>
                {/* <span className='text-xs text-muted-foreground ml-1'>({dbName.collections.length})</span> */}
              </button>

              <AnimatePresence>
                {cachedDatabases[databaseName] && (
                  <div>
                    <ScrollArea className='max-w-lg'>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className='ml-4 pl-1 border-l py-1'
                      >
                        {cachedDatabases[databaseName].map((collectionName) => {
                          const isActive = activeTab === `${databaseName}.${collectionName}`
                          return (
                            <motion.button
                              key={collectionName}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              onClick={() => onSelectCollection(databaseUri, databaseName, collectionName)}
                              className={cn(
                                'w-full text-left p-2 text-sm relative',
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
                            </motion.button>
                          )
                        })}
                      </motion.div>
                    </ScrollArea>
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
      <Dialog open={!isConnected}>
        <DialogContent hideClose>
          <DialogTitle>Connect</DialogTitle>
          <DialogDescription>Type or paste the connection string bellow to connect database</DialogDescription>
          <form
            className='grid gap-4'
            onSubmit={connectionForm.handleSubmit((values) => getDatabasesAction.execute(values.uri))}
          >
            <div className='grid gap-2'>
              <Label htmlFor='connection-string'>Connection String</Label>
              <Input
                {...connectionForm.register('uri', { required: 'Required field' })}
                id='connection-string'
                placeholder='mongodb://localhost:27017'
              />
            </div>

            <Button
              type='submit'
              className='w-full'
              loading={getDatabasesAction.isPending || getDatabasesAction.isSuccess}
            >
              Connect
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AnimatePresence mode='wait'>
        {databases.length > 0 && (
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <div className='px-4 pt-1'>
                <Button variant='ghost' size='icon' className='md:hidden'>
                  <Menu size={20} />
                </Button>
              </div>
            </SheetTrigger>
            <SheetContent side='left' className='w-[280px] p-0'>
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
          <motion.div
            variants={itemVariants}
            className='hidden md:flex sticky top-0 flex-col justify-between h-full pb-8'
          >
            {renderSidebarContent()}
            <div className='space-y-4'>
              {isConnected && (
                <Button variant='outline' size='sm' onClick={() => getDatabasesAction.reset()}>
                  <PlusCircle size={20} />
                  Change connection
                </Button>
              )}
              <ThemeToggle />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className='space-y-4 p-4'>
            {tabs.length > 0 && (
              <div className='flex flex-wrap overflow-x-auto border-b sticky top-0 z-10 backdrop-blur-lg'>
                {tabs.map((tabIdentifier) => (
                  <button
                    key={tabIdentifier}
                    onClick={() => setActiveTab(tabIdentifier)}
                    className={cn(
                      `flex items-center gap-1 px-3 py-4 whitespace-nowrap relative duration-500`,
                      activeTab !== tabIdentifier && 'text-muted-foreground',
                    )}
                  >
                    {activeTab === tabIdentifier && (
                      <motion.div layoutId='tab_active' className='absolute left-0 bottom-0 w-full h-0.5 bg-primary' />
                    )}
                    <span className='text-sm font-medium truncate max-w-[120px] sm:max-w-none'>{tabIdentifier}</span>
                    <X
                      role='button'
                      className='h-3.5 w-3.5 ml-1 text-muted-foreground hover:text-foreground'
                      onClick={() => onCloseTab(tabIdentifier)}
                    />
                  </button>
                ))}
              </div>
            )}

            <main className='bg-foreground/5 border shadow px-4 py-6 rounded-lg min-h-max'>
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
                        onSubmit={(values) =>
                          createDocumentAction.execute({
                            uri: databaseUri,
                            database: selectedDatabase,
                            collection: selectedCollection,
                            data: values,
                          })
                        }
                      />
                    </TabsContent>

                    <TabsContent value='insert' className='p-2'>
                      <JsonEditor
                        initialValue={{ name: 'John' }}
                        submitText='Insert'
                        onSubmit={(values) =>
                          queryDocumentsAction.execute({
                            uri: databaseUri,
                            database: selectedDatabase,
                            collection: selectedCollection,
                            query: values,
                          })
                        }
                      />
                    </TabsContent>
                  </Tabs>
                </>
              )}

              {documentsToShow ? (
                <span className='flex items-center gap-1'>
                  {selectedDatabase}.{selectedCollection}
                  <span className='text-sm font-normal text-muted-foreground'>
                    ({totalDocuments} document{totalDocuments < 2 ? '' : 's'})
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
                        className={`w-full flex items-center justify-between p-3 text-sm hover:bg-accent ${
                          expandedDocuments.includes(doc._id) ? 'bg-accent' : ''
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
                              <div className='flex justify-between items-center mb-2'>
                                <h4 className='text-sm font-medium'>Document Preview</h4>
                                <Button variant='outline' size='sm' onClick={() => setSelectedDocumentToEdit(doc._id)}>
                                  Edit
                                </Button>
                              </div>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.2 }}
                              >
                                {selectedDocumentToEdit === doc._id ? (
                                  <JsonEditor
                                    initialValue={doc}
                                    onSubmit={(value) =>
                                      updateDocumentAction.execute({
                                        uri: databaseUri,
                                        database: selectedDatabase,
                                        collection: selectedCollection,
                                        data: value,
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
