'use client'

import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'
import { Loader2, X } from 'lucide-react'

type Props = {
  tabs: string[]
  activeTab: string
  onSelectTab: (tabName: string) => void
  onCloseTab: (tabName: string) => void
  loadingTab: string
}

export function Tabs({ tabs, activeTab, onSelectTab, loadingTab, onCloseTab }: Props) {
  if (tabs.length === 0) return null

  return (
    <div className='space-y-8'>
      {tabs.length > 0 && (
        <div className='flex flex-wrap overflow-x-auto border-b sticky top-0 z-10 backdrop-blur-lg'>
          {tabs.map((tabIdentifier) => (
            <button
              key={tabIdentifier}
              onClick={() => onSelectTab(tabIdentifier)}
              className={cn(
                `flex items-center gap-2 px-3 py-4 whitespace-nowrap relative duration-500`,
                activeTab !== tabIdentifier && 'text-muted-foreground',
              )}
            >
              {activeTab === tabIdentifier && (
                <motion.div layoutId='tab_active' className='absolute left-0 bottom-0 w-full h-0.5 bg-primary' />
              )}
              <span className='text-sm font-medium truncate max-w-[120px] sm:max-w-none'>{tabIdentifier}</span>

              {loadingTab === tabIdentifier ? (
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
    </div>
  )
}
