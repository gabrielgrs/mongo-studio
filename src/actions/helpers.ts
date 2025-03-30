'use server'

import { connectToDatabase } from '@/libs/mongodb'
import { db } from '@/libs/mongoose'

export async function getUserIP() {
  const res = await fetch('https://api.ipify.org?format=json')
  const { ip } = await res.json()
  return ip
}

export async function getConnection(identifier: string, database?: string) {
  const ip = await getUserIP()

  const session = await db.session.findOne({ _id: identifier, ip })
  if (!session) throw new Error('Session not found')

  const client = await connectToDatabase(session.connectionString, database)
  return client
}

export async function testConnection(uri: string) {
  const client = await connectToDatabase(uri)
  client.close()
  return Boolean(client)
}
