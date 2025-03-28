'use client'

import { getCollectionData, getCollections, getDatabases } from '@/actions/mongodb'
import JsonEditor from '@/components/json-editor'
import QueryEditor from '@/components/query-editor'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/utils/cn'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  ChevronRight,
  Database,
  FolderOpen,
  Menu,
  MoonIcon,
  PlusCircle,
  RefreshCw,
  Save,
  SunIcon,
  X,
} from 'lucide-react'
import { WithId } from 'mongodb'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Button variant='outline' size='icon' onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      <SunIcon className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
      <MoonIcon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
      <span className='sr-only'>Toggle theme</span>
    </Button>
  )
}

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
  const [selectedDocument, setSelectedDocument] = useState<any>(null)

  const [editedDocument, setEditedDocument] = useState('')
  const [activeTab, setActiveTab] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [cachedDatabases, setCachedDatabases] = useState<Record<string, string[]>>({})
  const [cachedData, setCachedData] = useState<Record<string, { totalItems: number; data: WithId<any>[] }>>({})
  const [expandedDocuments, setExpandedDocuments] = useState<string[]>([])

  const connectionForm = useForm({ defaultValues: { uri: 'mongodb://localhost:27017' } })

  const { data: databases = [], ...getDatabasesAction } = useServerAction(getDatabases)
  const { data: collections = [], ...getCollectionsAction } = useServerAction(getCollections)
  const getCollectionDataAction = useServerAction(getCollectionData)

  const isConnected = databases.length > 0
  const databaseUri = useWatch({ control: connectionForm.control, name: 'uri' })
  const tabs = Object.keys(cachedData)
  const [selectedDatabase, selectedCollection] = activeTab.split('.')
  const documentsToShow = cachedData[activeTab]?.data

  // TODO: delete
  const onExecuteQuery = () => {}
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

  const onCloseTab = (tabIdentifier: string) =>
    setCachedData((prev) => {
      const newData = { ...prev }
      delete newData[tabIdentifier]
      return newData
    })

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
                className='w-full flex items-center gap-1 p-2 hover:bg-accent rounded-md text-left'
              >
                {cachedDatabases[databaseName] ? (
                  <ChevronDown className='h-4 w-4 text-muted-foreground' />
                ) : (
                  <ChevronRight className='h-4 w-4 text-muted-foreground' />
                )}
                <span>{databaseName}</span>
                {/* <span className='text-xs text-muted-foreground ml-1'>({dbName.collections.length})</span> */}
              </button>

              <AnimatePresence>
                {cachedDatabases[databaseName] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className='ml-6 pl-2 border-l py-1'
                  >
                    {cachedDatabases[databaseName].map((collectionName) => (
                      <motion.button
                        key={collectionName}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => onSelectCollection(databaseUri, databaseName, collectionName)}
                        className={`w-full text-left p-2 text-sm rounded-md hover:bg-accent flex items-center gap-1 ${
                          selectedDatabase === databaseName && selectedCollection === collectionName
                            ? 'bg-accent font-medium'
                            : ''
                        }`}
                      >
                        <FolderOpen className='h-3 w-3 text-muted-foreground' />
                        {collectionName}
                      </motion.button>
                    ))}
                  </motion.div>
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

      {true && (
        <div className='flex items-center justify-between p-4 border-b'>
          <div className='flex items-center gap-2'>
            {databases.length > 0 && (
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTitle></SheetTitle>
                <SheetTrigger asChild>
                  <Button variant='outline' size='icon' className='md:hidden'>
                    <Menu className='h-5 w-5' />
                  </Button>
                </SheetTrigger>
                <SheetContent side='left' className='w-[280px] p-0'>
                  {renderSidebarContent()}
                </SheetContent>
              </Sheet>
            )}
            <h1 className='text-xl font-bold flex items-center gap-2'>
              <Database className='h-5 w-5 text-primary' />
              MongoDB Admin
            </h1>
          </div>
          <div className='flex items-center gap-2'>
            {isConnected && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => getDatabasesAction.reset()}
                className='gap-1 hidden sm:flex'
              >
                <PlusCircle className='h-4 w-4' />
                Connect to Another Database
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      )}

      <AnimatePresence mode='wait'>
        <motion.div
          key='admin-interface'
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          className='grid grid-cols-1 md:grid-cols-[280px_1fr] items-start min-h-screen'
        >
          {/* Sidebar - Hidden on mobile, visible on desktop */}
          <motion.div variants={itemVariants} className='hidden md:block sticky top-0'>
            {renderSidebarContent()}
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants} className='flex flex-col space-y-4 p-4'>
            {/* Collection Tabs */}
            {tabs.length > 0 && (
              <div className='flex overflow-x-auto border-b sticky top-0 z-10 backdrop-blur-lg'>
                {tabs.map((tabIdentifier) => (
                  <button
                    key={tabIdentifier}
                    onClick={() => setActiveTab(tabIdentifier)}
                    className={cn(
                      `flex items-center gap-1 px-3 py-2 whitespace-nowrap relative duration-500`,
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

            {selectedCollection && (
              <Card>
                <CardHeader>
                  <CardTitle>Query & Insert</CardTitle>
                  <CardDescription>Execute MongoDB queries or insert new documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <QueryEditor onExecute={() => onExecuteQuery()} />
                </CardContent>
              </Card>
            )}

            {/* Data Display */}
            <Card className='p-4'>
              <CardHeader>
                <CardTitle>
                  {documentsToShow ? (
                    <span className='flex items-center gap-1'>
                      <FolderOpen className='h-5 w-5 text-primary' />
                      {selectedDatabase}.{selectedCollection}
                      <span className='text-sm font-normal text-muted-foreground ml-2'>
                        ({documentsToShow.length} documents)
                      </span>
                    </span>
                  ) : (
                    'Select a collection'
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                {documentsToShow ? (
                  <Tabs defaultValue='documents' className='w-full'>
                    <TabsList className='mx-4 mt-2'>
                      <TabsTrigger value='documents'>Documents</TabsTrigger>
                      <TabsTrigger value='editor'>JSON Editor</TabsTrigger>
                    </TabsList>
                    <TabsContent value='documents' className='p-2'>
                      <div className='border rounded-md'>
                        <div className='p-3 bg-muted font-medium'>Documents</div>
                        <div className='p-2 space-y-2'>
                          {documentsToShow.map((doc) => (
                            <div key={doc._id} className='border rounded-md mb-2'>
                              <button
                                onClick={() => onSelectDocument(doc._id)}
                                className={`w-full flex items-center justify-between p-3 text-sm hover:bg-accent ${
                                  expandedDocuments.includes(doc._id) ? 'bg-accent' : ''
                                }`}
                              >
                                <div className='font-mono text-xs truncate flex-1 text-left'>
                                  {JSON.stringify(doc).substring(0, 60)}...
                                </div>
                                {expandedDocuments.includes(doc._id) ? (
                                  <ChevronDown className='h-4 w-4 flex-shrink-0' />
                                ) : (
                                  <ChevronRight className='h-4 w-4 flex-shrink-0' />
                                )}
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
                                        <div className='flex gap-2'>
                                          {selectedDocument?._id === doc._id ? (
                                            <>
                                              <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() => setSelectedDocument('')}
                                              >
                                                Cancel
                                              </Button>
                                              <Button
                                                size='sm'
                                                onClick={() => setSelectedDocument('')}
                                                className='gap-1'
                                              >
                                                <Save className='h-3.5 w-3.5' />
                                                Save
                                              </Button>
                                            </>
                                          ) : (
                                            <Button
                                              variant='outline'
                                              size='sm'
                                              onClick={() => setEditedDocument(doc._id)}
                                            >
                                              Edit
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                      <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.1, duration: 0.2 }}
                                      >
                                        {selectedDocument?._id === doc._id ? (
                                          <JsonEditor
                                            value={editedDocument}
                                            onChange={setEditedDocument}
                                            readOnly={false}
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
                      </div>
                    </TabsContent>
                    <TabsContent value='editor' className='p-4 pt-2 h-[calc(100%-3rem)] overflow-auto'>
                      {selectedDocument ? (
                        <div>
                          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4'>
                            <h3 className='text-lg font-medium'>
                              Editing Document: <span className='font-mono text-sm'>{selectedDocument._id}</span>
                            </h3>
                            <div className='flex gap-2'>
                              <Button variant='outline' onClick={() => {}}>
                                Cancel
                              </Button>
                              <Button onClick={() => {}} className='gap-1'>
                                <Save className='h-4 w-4' />
                                Save Changes
                              </Button>
                            </div>
                          </div>
                          <JsonEditor
                            value={editedDocument}
                            onChange={setEditedDocument}
                            //  readOnly={!isEditing}
                          />
                        </div>
                      ) : (
                        <div className='text-center text-muted-foreground p-8'>Select a document to edit</div>
                      )}
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className='flex items-center justify-center text-muted-foreground'>
                    Select a collection from the sidebar to view documents
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
