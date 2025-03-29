'use server'

import { connectToDatabase } from '@/libs/mongodb'
import { parseData } from '@/utils/action'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { createServerAction } from 'zsa'

export const getDatabases = createServerAction()
  .input(z.string())
  .handler(async ({ input: uri }) => {
    const client = await connectToDatabase(uri)

    const { databases } = await client.db().admin().listDatabases()
    return databases.map((item) => item.name)
  })

export const getCollections = createServerAction()
  .input(z.object({ uri: z.string(), database: z.string() }))
  .onError(console.error)
  .handler(async ({ input: { uri, database } }) => {
    const client = await connectToDatabase(uri, database)
    const collections = await client.db().listCollections().toArray()

    return collections.map((item) => item.name)
  })

const ITEMS_PER_PAGE = 10

export const getCollectionData = createServerAction()
  .input(
    z.object({
      uri: z.string(),
      database: z.string(),
      collection: z.string(),
      page: z.number(),
      query: z.string().optional(),
    }),
  )
  .handler(async ({ input: { uri, database, collection, page, query } }) => {
    const client = await connectToDatabase(uri, database)

    const totalItems = await client.db().collection(collection).countDocuments()
    const collectionData = await client
      .db()
      .collection(collection)
      .find(query ? JSON.parse(query) : {})
      .limit(page * ITEMS_PER_PAGE)
      .toArray()

    const response = { data: collectionData, totalItems, identifier: `${database}.${collection}` }
    return JSON.parse(JSON.stringify(response)) as typeof response
  })

export const createDocument = createServerAction()
  .input(
    z.object({
      uri: z.string(),
      database: z.string(),
      collection: z.string(),
      data: z.string(),
    }),
  )
  .handler(async ({ input: { uri, database, collection, data } }) => {
    const client = await connectToDatabase(uri, database)
    const collectionRef = client.db().collection(collection)
    const result = await collectionRef.insertOne(JSON.parse(data))
    return result.insertedId.toString()
  })

export const updateDocument = createServerAction()
  .input(
    z.object({
      uri: z.string(),
      database: z.string(),
      collection: z.string(),
      documentId: z.string(),
      data: z.string(),
    }),
  )
  .onError(console.error)
  .handler(async ({ input: { uri, database, collection, documentId, data } }) => {
    const client = await connectToDatabase(uri, database)
    const collectionRef = client.db().collection(collection)
    const parsedData = JSON.parse(data)
    // Prevent updating the _id field
    delete parsedData._id
    const result = await collectionRef.findOneAndUpdate({ _id: new ObjectId(documentId) }, { $set: parsedData })
    return parseData(result)
  })
