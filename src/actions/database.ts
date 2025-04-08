'use server'

import { z } from 'zod'
import { connectionProcedure } from './procedures'

export const getDatabases = connectionProcedure.createServerAction().handler(async ({ ctx }) => {
  const { databases } = await ctx.client.db().admin().listDatabases()

  return databases.map((item) => item.name)
})

export const createDatabase = connectionProcedure
  .createServerAction()
  .input(z.object({ collection: z.string() }))
  .handler(async ({ ctx, input: { database, collection } }) => {
    await ctx.client.db(database).createCollection(collection)

    return true
  })

export const removeDatabase = connectionProcedure
  .createServerAction()
  .input(
    z.object({
      database: z.string(),
    }),
  )
  .handler(async ({ ctx, input: { database } }) => {
    if (['admin', 'local'].includes(database)) throw new Error(`Cannot drop ${database} database`)

    await ctx.client.db(database).dropDatabase()

    return true
  })
