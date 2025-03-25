'use server'

import { parseData } from '@/utils/actions'
import { MongoClient } from 'mongodb'
import { z } from 'zod'
import { createServerAction } from 'zsa'

const normalizeUri = (uri: string) => `mongodb+srv://${uri.split('/').find((x) => x.includes(':') && x.includes('@'))}`

export const testConnection = createServerAction()
  .input(z.string())
  .handler(async ({ input }) => {
    const uri = normalizeUri(input)
    const client = new MongoClient(uri)

    await client.connect()
    return { uri: uri.split('//')[1] }
  })

export const getDatabases = createServerAction()
  .input(z.string())
  .handler(async ({ input: uri }) => {
    const client = new MongoClient(normalizeUri(uri))

    await client.connect()
    const { databases } = await client.db().admin().listDatabases()
    return databases.map((item) => item.name)
  })

export const getCollections = createServerAction()
  .input(z.object({ uri: z.string(), database: z.string() }))
  .handler(async ({ input: { uri, database } }) => {
    const client = new MongoClient(`${normalizeUri(uri)}/${database}`)

    await client.connect()
    const collections = await client.db().listCollections().toArray()

    return collections.map((item) => item.name)
  })

const ITEMS_PER_PAGE = 10

export const getCollectionData = createServerAction()
  .input(z.object({ uri: z.string(), database: z.string(), collection: z.string(), page: z.number() }))
  .handler(async ({ input: { uri, database, collection, page } }) => {
    const client = new MongoClient(`${normalizeUri(uri)}/${database}`)

    await client.connect()
    const totalItems = await client.db().collection(collection).countDocuments()
    const collectionData = await client
      .db()
      .collection(collection)
      .find()
      .limit(page * ITEMS_PER_PAGE)
      .toArray()

    return parseData({ data: collectionData, totalItems, identifier: `${database}.${collection}` })
  })
