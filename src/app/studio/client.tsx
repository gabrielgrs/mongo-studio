'use client'

import { getCollectionData, getCollections, getDatabases } from '@/actions/mongodb'
import { Fragment, useState } from 'react'
import { DataTable } from './data-table'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'
import { ChevronRight, Loader2, X } from 'lucide-react'
import { Document, WithId } from 'mongodb'
import { motion } from 'motion/react'
import { useForm, useWatch } from 'react-hook-form'
import { useServerAction } from 'zsa-react'

function Loader() {
  return (
    <div className='w-full h-full flex items-center justify-center'>
      <Loader2 size={32} className='animate-spin' />
    </div>
  )
}

const Divider = () => <hr />

export function StudioClient() {
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false)
  const [selectedDatabase, setSelectedDatabase] = useState('')
  const [selectedCollection, setSelectedCollection] = useState('')
  const [totalItems, setTotalItems] = useState(0)
  const [page] = useState(1)
  const [cachedData, setCachedData] = useState<{ identifier: string; data: WithId<Document>[] }[]>([])

  const form = useForm({ defaultValues: { uri: '' } })
  const uri = useWatch({ control: form.control, name: 'uri' })
  const connectDatabase = useServerAction(getDatabases, {
    onSuccess: () => setIsConnectionModalOpen(false),
  })
  const getCollectionsAction = useServerAction(getCollections)
  const getCollectionDataAction = useServerAction(getCollectionData, {
    onSuccess: ({ data: { totalItems, identifier, data } }) => {
      setTotalItems(totalItems)
      setCachedData((p) => {
        if (!p.find((item) => item.identifier === identifier)) {
          return [...p, { identifier, data }]
        }
        return p.map((item) => (item.identifier === identifier ? { identifier, data } : item))
      })
    },
  })

  const dataToRender =
    cachedData.find((item) => item.identifier === `${selectedDatabase}.${selectedCollection}`)?.data ||
    getCollectionDataAction.data?.data ||
    []

  return (
    <div className='grid grid-cols-[280px_auto] min-h-screen items-start'>
      <aside className='h-full sticky top-0 border-r p-2 space-y-4 bg-foreground/5'>
        <Label>Start new connection</Label>
        <Dialog open={isConnectionModalOpen} onOpenChange={setIsConnectionModalOpen}>
          <DialogTrigger asChild>
            <Button className='w-full'>Connect</Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[425px]'>
            <form
              onSubmit={form.handleSubmit((values) => {
                connectDatabase.execute(values.uri)
              })}
            >
              <DialogHeader>
                <DialogTitle>Connection</DialogTitle>
                <DialogDescription>Add connection string</DialogDescription>
              </DialogHeader>

              <Label htmlFor='uri' className='text-right'>
                URI
              </Label>
              <Input id='uri' {...form.register('uri', { required: 'Required field' })} />
              <DialogFooter>
                <Button
                  disabled={connectDatabase.isPending || connectDatabase.isSuccess}
                  type='button'
                  variant='ghost'
                  onClick={() => {
                    form.reset()

                    setIsConnectionModalOpen(false)
                  }}
                >
                  Close
                </Button>
                <Button type='submit' loading={connectDatabase.isPending || connectDatabase.isSuccess}>
                  Connect
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {connectDatabase.data && (
          <>
            <Divider />
            <Label>Databases</Label>
            {connectDatabase.data.map((db) => (
              <Fragment key={db}>
                <button
                  value={db}
                  className='flex items-center gap-1 cursor-pointer'
                  onClick={() => {
                    setSelectedDatabase(db)
                    getCollectionsAction.execute({ uri, database: db })
                  }}
                >
                  <ChevronRight size={16} />
                  {db}
                  {getCollectionsAction.isPending && selectedDatabase === db && (
                    <Loader2 size={16} className='animate-spin' />
                  )}
                </button>
                {selectedDatabase === db && (
                  <motion.ul initial={{ height: 0 }} animate={{ height: 'auto' }} className={cn('space-y-2 pl-2')}>
                    {getCollectionsAction?.data?.map((c) => {
                      return (
                        <li key={c}>
                          <button
                            type='button'
                            className={cn(
                              'cursor-pointer flex items-center gap-1 w-full duration-500 py-0.5 px-2 relative',
                            )}
                            onClick={() => {
                              setSelectedCollection(c)
                              getCollectionDataAction.execute({
                                uri,
                                database: selectedDatabase,
                                collection: c,
                                page: 1,
                              })
                            }}
                          >
                            {selectedCollection === c && (
                              <motion.div
                                layoutId='selectedCollection'
                                className='absolute inset-y-0 left-0 w-full h-full rounded-lg bg-foreground/20 flex'
                              />
                            )}
                            <span className='w-2 h-2 bg-green-500 rounded-full translate-y-0.5' />
                            {c}
                            {getCollectionDataAction.isPending && selectedCollection === c && (
                              <Loader2 size={16} className='animate-spin' />
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </motion.ul>
                )}
              </Fragment>
            ))}
          </>
        )}

        {getCollectionsAction.data && (
          <>
            <Divider />
            <Label>Collections</Label>
          </>
        )}
      </aside>

      {selectedCollection && (
        <main className='p-4'>
          <div className='flex items-center gap-1 text-sm'>
            <span className='text-muted-foreground'>{selectedDatabase}</span>
            <ChevronRight size={16} className='text-muted-foreground' />
            <span>{selectedCollection}</span>
          </div>

          <div className='flex items-center text-sm'>
            {cachedData.map(({ identifier }) => (
              <div key={identifier} className='relative'>
                <button
                  onClick={() => {
                    const [database, collection] = identifier.split('.')
                    setSelectedCollection(collection)
                    getCollectionDataAction.execute({ collection, database, page: 1, uri })
                  }}
                  className={cn(
                    'cursor-pointer rounded-t-lg py-2 pl-4 pr-8',
                    identifier === `${selectedDatabase}.${selectedCollection}`
                      ? 'bg-foreground/10'
                      : 'text-muted-foreground',
                  )}
                >
                  {identifier}
                </button>

                <button
                  disabled={getCollectionDataAction.isPending && selectedDatabase === identifier.split('.')[0]}
                  className='absolute top-[50%] translate-y-[-50%] right-2 disabled:cursor-not-allowed cursor-pointer'
                  onClick={() => {
                    const cacheItemIndex = cachedData.findIndex((item) => item.identifier !== identifier)
                    setCachedData((p) => p.filter((_, index) => index !== cacheItemIndex))

                    setSelectedCollection(
                      cachedData.at(cacheItemIndex - 1)?.identifier || cachedData.at(0)?.identifier || '',
                    )
                  }}
                >
                  {getCollectionDataAction.isPending && `${selectedDatabase}.${selectedCollection}` === identifier ? (
                    <Loader2 size={12} className='animate-spin' />
                  ) : (
                    <X size={12} />
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className='bg-foreground/10 py-4 space-y-4'>
            {getCollectionDataAction.isPending && dataToRender.length === 0 && <Loader />}
            {!getCollectionDataAction.isPending && dataToRender.length === 0 && (
              <p className='text-lg text-muted-foreground text-center'>No data found</p>
            )}
            {dataToRender.length > 0 && (
              <div>
                <DataTable data={dataToRender} />
                {totalItems < (getCollectionDataAction.data?.data?.length || 0) && (
                  <button
                    type='button'
                    onClick={() =>
                      getCollectionDataAction.execute({
                        uri,
                        collection: selectedCollection,
                        database: selectedDatabase,
                        page: page + 1,
                      })
                    }
                  >
                    Load more
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  )
}
