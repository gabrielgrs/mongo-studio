'use server'

import { db } from '@/libs/mongoose'
import { parseData } from '@/utils/action'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { createServerAction } from 'zsa'
import { getConnection, testConnection } from './helpers'

export const generateSession = createServerAction()
  .input(z.string())
  .handler(async ({ input: uri }) => {
    await testConnection(uri)

    const session = await db.session.create({
      connectionString: uri,
    })

    return session._id.toString()
  })

export const getDatabases = createServerAction()
  .input(z.object({ identifier: z.string() }))
  .handler(async ({ input }) => {
    const client = await getConnection(input.identifier)

    const { databases } = await client.db().admin().listDatabases()

    client.close()

    return databases.map((item) => item.name)
  })

export const getCollections = createServerAction()
  .input(z.object({ identifier: z.string(), database: z.string() }))
  .handler(async ({ input: { identifier, database } }) => {
    const client = await getConnection(identifier, database)
    const collections = await client.db().listCollections().toArray()

    client.close()

    return collections.map((item) => item.name)
  })

const ITEMS_PER_PAGE = 10

export const getCollectionData = createServerAction()
  .input(
    z.object({
      identifier: z.string(),
      database: z.string(),
      collection: z.string(),
      page: z.number(),
      query: z.string().optional(),
    }),
  )
  .handler(async ({ input: { identifier, database, collection, page, query } }) => {
    const client = await getConnection(identifier, database)

    const totalItems = await client.db().collection(collection).countDocuments()
    const collectionData = await client
      .db()
      .collection(collection)
      .find(query ? JSON.parse(query) : {})
      .limit(page * ITEMS_PER_PAGE)
      .toArray()

    client.close()

    const response = { data: collectionData, totalItems, identifier: `${database}.${collection}` }
    return JSON.parse(JSON.stringify(response)) as typeof response
  })

export const createDocument = createServerAction()
  .input(
    z.object({
      identifier: z.string(),
      database: z.string(),
      collection: z.string(),
      data: z.string(),
    }),
  )
  .handler(async ({ input: { identifier, database, collection, data } }) => {
    const client = await getConnection(identifier, database)
    const collectionRef = client.db().collection(collection)
    const result = await collectionRef.insertOne(JSON.parse(data))

    client.close()

    return result.insertedId.toString()
  })

export const updateDocument = createServerAction()
  .input(
    z.object({
      identifier: z.string(),
      database: z.string(),
      collection: z.string(),
      documentId: z.string(),
      data: z.string(),
    }),
  )
  .handler(async ({ input: { identifier, database, collection, documentId, data } }) => {
    const client = await getConnection(identifier, database)
    const collectionRef = client.db().collection(collection)
    const parsedData = JSON.parse(data)
    // Prevent updating the _id field
    delete parsedData._id
    const result = await collectionRef.findOneAndUpdate({ _id: new ObjectId(documentId) }, { $set: parsedData })

    client.close()

    return parseData(result)
  })
