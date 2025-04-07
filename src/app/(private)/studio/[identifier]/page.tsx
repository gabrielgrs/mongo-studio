import { getDatabases } from '@/actions'
import Link from 'next/link'
import { StudioClient } from './client'

type Props = {
  params: Promise<{ identifier: string }>
}
export default async function Home({ params }: Props) {
  const { identifier } = await params
  const [data, error] = await getDatabases({ identifier: identifier })

  if (error)
    return (
      <div>
        <p className='text-muted-foreground'>Session not found</p>
        <Link href='/'>Back to home</Link>
      </div>
    )
  return <StudioClient databases={data} sessionIdentifier={identifier} />
}
