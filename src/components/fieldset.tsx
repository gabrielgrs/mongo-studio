import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import { ReactNode } from 'react'
import { Label } from './ui/label'

type FieldsetProps = {
  children: ReactNode
  label: string
  error?: string
  info?: ReactNode
  tooltip?: ReactNode
}

export function Fieldset({ children, label, error, info, tooltip }: FieldsetProps) {
  return (
    <fieldset className='relative'>
      <div className='flex items-center gap-2 mb-1'>
        <Label>{label}</Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger type='button'>
                <Info size={14} />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className='relative'>{children}</div>
      <p
        role='alert'
        data-show={Boolean(error || info)}
        data-danger={Boolean(error)}
        className='text-xs overflow-hidden pl-1 text-foreground/50 transition-all duration-500 data-[show=false]:max-h-0 data-[show=true]:max-h-14 data-[danger=true]:text-red-400'
      >
        {error || info}
      </p>
    </fieldset>
  )
}
