'use client'

import { removeSession } from '@/actions'
import { AreYouSure } from '@/components/are-you-sure'
import { Link } from '@/components/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'
import { APP_NAME } from '@/utils/constants'
import { Ellipsis, Loader2, LogOut, Moon, Sun, Trash, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
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
  onToggleSidebar: () => void
}
export function DatabaseList({
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
  onToggleSidebar,
}: Props) {
  const { theme, setTheme } = useTheme()

  return (
    <>
      <div className={cn('flex h-18 items-center justify-between gap-2 p-2')}>
        <div className='flex items-center gap-1'>
          <Image src='/logo.svg' width={24} height={24} alt='Mongo Studio logo' />
          <p>{APP_NAME}</p>
        </div>
        <Button variant='outline' size='icon' onClick={onToggleSidebar} className='flex md:hidden'>
          <X />
        </Button>
      </div>

      <div className='px-2'>
        <div className='mb-2'>
          <DatabaseFormModal sessionIdentifier={sessionIdentifier} onAddDatabase={onAddDatabase}>
            <Button className='w-full' variant='secondary' size={showSidebar ? 'default' : 'icon'}>
              Add database
            </Button>
          </DatabaseFormModal>
        </div>
        <>
          <Label className='text-muted-foreground'>Databases</Label>
          {databases.map((databaseName) => (
            <div key={databaseName}>
              <div className='flex items-center gap-1'>
                <button
                  onClick={() => onSelectDatabase(databaseName)}
                  className='w-full flex items-center gap-1 p-2 hover:bg-card rounded-md text-left text-sm relative'
                >
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
        </>
        <div className='space-y-2 mt-4'>
          <Button
            variant='ghost'
            className='w-full text-muted-foreground'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            Toggle theme
          </Button>

          <Link
            href='/'
            onClick={() => removeSession(sessionIdentifier)}
            title='Disconnect'
            className={cn(buttonVariants({ variant: 'ghost' }), 'w-full text-muted-foreground')}
          >
            <LogOut size={18} />
            Exit session
          </Link>
        </div>
      </div>
    </>
  )
}
