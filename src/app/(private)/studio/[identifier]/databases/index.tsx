'use client'

import { AreYouSure } from '@/components/are-you-sure'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'
import { ChevronRight, Ellipsis, Loader2, Trash } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { DatabaseFormModal } from './database-form-modal'

type Props = {
  sessionIdentifier: string
  databases: string[]
  showSidebar: boolean
  openDatabases: Record<string, string[]>
  loadingTab: string
  isRemovingDatabase: boolean
  activeTab: string
  onSelectDatabase: (databaseName: string) => void
  onRemoveDatabase: (databaseName: string) => Promise<unknown>
  onGetData: (databaseName: string, collectionName: string) => Promise<unknown>
  onRemoveCollection: (databaseName: string, collectionName: string) => Promise<unknown>
  onAddDatabase: (databaseName: string, collectionName: string) => void
  isRemovingCollection: boolean
}
export function Databases({
  sessionIdentifier,
  databases,
  showSidebar,
  onSelectDatabase,
  openDatabases,
  loadingTab,
  onRemoveDatabase,
  isRemovingDatabase,
  onGetData,
  activeTab,
  onRemoveCollection,
  onAddDatabase,
  isRemovingCollection,
}: Props) {
  return (
    <aside
      className={cn(
        'fixed md:sticky left-0 top-0 h-screen duration-500 overflow-x-hidden backdrop-blur-lg ',
        showSidebar ? 'max-w-[220px] min-w-[220px] border' : 'max-w-0 min-w-0 translate-x-[-100%] md:translate-x-0',
      )}
    >
      <div className='p-2'>
        <div className='flex items-center justify-between'>
          <Label>databases</Label>
          <DatabaseFormModal sessionIdentifier={sessionIdentifier} onAddDatabase={onAddDatabase} />
        </div>
        {databases.map((databaseName) => (
          <div key={databaseName}>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => onSelectDatabase(databaseName)}
                className='w-full flex items-center gap-1 p-2 hover:bg-card rounded-md text-left text-sm relative'
              >
                <ChevronRight
                  size={16}
                  className={cn('text-muted-foreground duration-500', openDatabases[databaseName] && 'rotate-90')}
                />

                <span className='whitespace-nowrap'>{databaseName}</span>
                <div className='absolute right-2 top-[50%] translate-y-[-50%] z-50'>
                  {loadingTab.includes(`${databaseName}.`) && (
                    <Loader2 size={14} className='animate-spin text-muted-foreground' />
                  )}
                </div>
              </button>

              {openDatabases[databaseName] && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className='text-muted-foreground'>
                      <Ellipsis size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <AreYouSure
                        confirmationText={databaseName}
                        onConfirm={() => onRemoveDatabase(databaseName)}
                        loading={isRemovingDatabase}
                      >
                        <button className='text-muted-foreground hover:text-destructive duration-500 flex text-sm items-center gap-2 px-1'>
                          <Trash role='button' size={14} /> Remove database
                        </button>
                      </AreYouSure>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <AnimatePresence>
              {openDatabases[databaseName] && (
                <div>
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
                            onClick={() => onGetData(databaseName, collectionName)}
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
                            {loadingTab === `${databaseName}.${collectionName}` && (
                              <Loader2 size={14} className='animate-spin text-muted-foreground' />
                            )}
                          </motion.button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className='text-muted-foreground'>
                                <Ellipsis size={16} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem asChild>
                                <AreYouSure
                                  confirmationText={collectionName}
                                  onConfirm={() => onRemoveCollection(databaseName, collectionName)}
                                  loading={isRemovingCollection}
                                >
                                  <button className='text-muted-foreground hover:text-destructive duration-500 flex text-sm items-center gap-2 px-1'>
                                    <Trash role='button' size={14} /> Remove collection
                                  </button>
                                </AreYouSure>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
    </aside>
  )
}
