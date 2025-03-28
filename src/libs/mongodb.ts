// This file handles MongoDB connection logic using the environment variables

import { MongoClient } from 'mongodb'

let client: MongoClient | null = null

export async function connectToDatabase(rawUri: string, database?: string) {
  // if (client) return client

  const connectionString = rawUri.split('/').find((x) => x.includes(':') && x.includes('@'))
  const uri = `mongodb+srv://${connectionString}`
  client = new MongoClient(database ? `${uri}/${database}` : uri)

  await client.connect()

  return client
}
