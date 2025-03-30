import { getDatabases } from '@/actions/mongodb'
import { StudioClient } from './client'

type Props = {
  params: Promise<{ identifier: string }>
}
export default async function Home({ params }: Props) {
  const { identifier } = await params
  const [data, error] = await getDatabases({ identifier: identifier })

  if (error) throw error
  return <StudioClient databases={data} identifier={identifier} />
}
