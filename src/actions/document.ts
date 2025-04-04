'use server'

import { parseData } from '@/utils/action'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { createServerAction } from 'zsa'
import { getConnection } from './helpers'

const ITEMS_PER_PAGE = 10

export const getDocuments = createServerAction()
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

    return parseData(result)
  })

export const removeDocument = createServerAction()
  .input(
    z.object({
      identifier: z.string(),
      database: z.string(),
      collection: z.string(),
      documentId: z.string(),
    }),
  )
  .handler(async ({ input: { identifier, database, collection, documentId } }) => {
    const client = await getConnection(identifier, database)
    const collectionRef = client.db().collection(collection)
    const result = await collectionRef.findOneAndDelete({ _id: new ObjectId(documentId) })

    return parseData(result)
  })
