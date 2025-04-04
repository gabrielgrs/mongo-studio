import { MongoClient } from 'mongodb'

let clients = new Map<string, MongoClient>()

function getUri(uri: string, database?: string) {
  const connectionString = uri.split('/').find((x) => x.includes(':') && x.includes('@'))
  const startUri = `mongodb+srv://${connectionString}`
  return database ? `${startUri}/${database}` : startUri
}

export async function connectToDatabase(rawUri: string, database?: string) {
  const uri = getUri(rawUri, database)
  const activeClient = clients.get(uri)
  if (activeClient) return activeClient

  const client = new MongoClient(uri)
  await client.connect()
  clients.set(uri, client)

  return client
}
