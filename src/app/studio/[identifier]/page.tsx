import { getDatabases } from '@/actions'
import { Link } from '@/components/link'
import { buttonVariants } from '@/components/ui/button'
import { StudioClient } from './client'

type Props = {
  params: Promise<{ identifier: string }>
}
export default async function Home({ params }: Props) {
  const { identifier } = await params
  const [data, error] = await getDatabases({ identifier, database: '' })

  if (error)
    return (
      <div className='h-[90vh] flex items-center justify-center flex-col gap-4'>
        <p className='text-muted-foreground'>Session not found or expired</p>
        <Link href='/' className={buttonVariants({ variant: 'outline' })}>
          Back to home
        </Link>
      </div>
    )

  return <StudioClient databases={data} sessionIdentifier={identifier} />
}
