'use server'

import { z } from 'zod'
import { createServerAction } from 'zsa'
import { getConnection } from './helpers'

export const getCollections = createServerAction()
  .input(z.object({ identifier: z.string(), database: z.string() }))
  .handler(async ({ input: { identifier, database } }) => {
    const client = await getConnection(identifier, database)
    const collections = await client.db().listCollections().toArray()

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

    const response = { data: collectionData, totalItems, identifier: `${database}.${collection}` }
    return JSON.parse(JSON.stringify(response)) as typeof response
  })

export const createCollection = createServerAction()
  .input(
    z.object({
      identifier: z.string(),
      database: z.string(),
      name: z.string(),
    }),
  )
  .handler(async ({ input: { identifier, database, name } }) => {
    const client = await getConnection(identifier, database)
    await client.db().createCollection(name)

    return { name }
  })

export const removeCollection = createServerAction()
  .input(z.object({ identifier: z.string(), database: z.string(), collectionName: z.string() }))
  .handler(async ({ input: { identifier, database, collectionName } }) => {
    const client = await getConnection(identifier, database)
    await client.db().collection(collectionName).drop()

    return {
      database,
      collectionName,
    }
  })
