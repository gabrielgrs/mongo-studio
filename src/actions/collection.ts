'use server'

import { z } from 'zod'
import { connnectionProcedure } from './procedures'

export const getCollections = connnectionProcedure.createServerAction().handler(async ({ ctx }) => {
  const collections = await ctx.client.db().listCollections().toArray()

  return collections.map((item) => item.name)
})

const ITEMS_PER_PAGE = 10

export const getCollectionData = connnectionProcedure
  .createServerAction()
  .input(
    z.object({
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

export const createCollection = connnectionProcedure
  .createServerAction()
  .input(
    z.object({
      name: z.string(),
    }),
  )
  .handler(async ({ ctx, input: { name } }) => {
    await ctx.client.db().createCollection(name)

    return { name }
  })

export const removeCollection = connnectionProcedure
  .createServerAction()
  .input(z.object({ identifier: z.string(), collectionName: z.string() }))
  .handler(async ({ ctx, input: { collectionName } }) => {
    await ctx.client.db().collection(collectionName).drop()

    return {
      database: ctx.database,
      collectionName,
    }
  })
