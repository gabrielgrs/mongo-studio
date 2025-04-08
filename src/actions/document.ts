'use server'

import { parseData } from '@/utils/action'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { connectionProcedure } from './procedures'

const ITEMS_PER_PAGE = 10

export const getDocuments = connectionProcedure
  .createServerAction()
  .input(
    z.object({
      database: z.string(),
      collection: z.string(),
      page: z.number(),
      query: z.string().optional(),
    }),
  )
  .handler(async ({ ctx, input: { database, collection, page, query } }) => {
    const totalItems = await ctx.client.db().collection(collection).countDocuments()
    const collectionData = await ctx.client
      .db()
      .collection(collection)
      .find(query ? JSON.parse(query) : {})
      .limit(page * ITEMS_PER_PAGE)
      .toArray()

    const response = { data: collectionData, totalItems, identifier: `${database}.${collection}` }
    return JSON.parse(JSON.stringify(response)) as typeof response
  })

export const createDocument = connectionProcedure
  .createServerAction()
  .input(
    z.object({
      collection: z.string(),
      data: z.string(),
    }),
  )
  .handler(async ({ ctx, input: { collection, data } }) => {
    const collectionRef = ctx.client.db().collection(collection)
    const result = await collectionRef.insertOne(JSON.parse(data))

    return result.insertedId.toString()
  })

export const updateDocument = connectionProcedure
  .createServerAction()
  .input(
    z.object({
      collection: z.string(),
      documentId: z.string(),
      data: z.string(),
    }),
  )
  .handler(async ({ ctx, input: { collection, documentId, data } }) => {
    const collectionRef = ctx.client.db().collection(collection)
    const parsedData = JSON.parse(data)
    // Prevent updating the _id field
    delete parsedData._id
    const result = await collectionRef.findOneAndUpdate({ _id: new ObjectId(documentId) }, { $set: parsedData })

    return parseData(result)
  })

export const removeDocument = connectionProcedure
  .createServerAction()
  .input(
    z.object({
      collection: z.string(),
      documentId: z.string(),
    }),
  )
  .handler(async ({ ctx, input: { collection, documentId } }) => {
    const collectionRef = ctx.client.db().collection(collection)
    const result = await collectionRef.findOneAndDelete({ _id: new ObjectId(documentId) })

    return parseData(result)
  })
