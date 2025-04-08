'use server'

import { connectToDatabase } from '@/libs/mongodb'

export async function testConnection(uri: string) {
  const client = await connectToDatabase(uri)

  return Boolean(client)
}
