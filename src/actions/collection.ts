'use server'

import { parseData } from '@/utils/action'
import { z } from 'zod'
import { connectionProcedure } from './procedures'

export const getCollections = connectionProcedure.createServerAction().handler(async ({ ctx }) => {
  const collections = await ctx.client.db().listCollections().toArray()

  return collections.map((item) => item.name)
})

const ITEMS_PER_PAGE = 10

export const getCollectionData = connectionProcedure
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
    const databaseRef = ctx.client.db()

    // const dbStats = await databaseRef.stats()
    const collectionStats = await databaseRef.command({ collStats: collection })

    const collectionData = await ctx.client
      .db()
      .collection(collection)
      .find(query ? JSON.parse(query) : {})
      .limit(page * ITEMS_PER_PAGE)
      .toArray()

    return parseData({
      documents: collectionData,
      totalItems: Number(collectionStats.count),
      storageSize: Number(collectionStats.storageSize),
      totalIndexes: Number(collectionStats.nindexes),
      identifier: `${database}.${collection}`,
    })
  })

export const createCollection = connectionProcedure
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

export const removeCollection = connectionProcedure
  .createServerAction()
  .input(z.object({ database: z.string(), collectionName: z.string() }))
  .handler(async ({ ctx, input: { database, collectionName } }) => {
    await ctx.client.db().collection(collectionName).drop()

    return {
      database,
      collectionName,
    }
  })
