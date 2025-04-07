'use server'

import { connectToDatabase } from '@/libs/mongodb'
import { db } from '@/libs/mongoose'

export async function getConnection(identifier: string, database?: string) {
  const session = await db.session.findOne({ _id: identifier })
  if (!session) throw new Error('SESSION_NOT_FOUND')

  // TODO: fix
  return connectToDatabase('', database)
}

export async function testConnection(uri: string) {
  const client = await connectToDatabase(uri)

  return Boolean(client)
}
