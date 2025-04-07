'use server'

import { z } from 'zod'
import { connnectionProcedure } from './procedures'

export const getDatabases = connnectionProcedure.createServerAction().handler(async ({ ctx }) => {
  const { databases } = await ctx.client.db().admin().listDatabases()

  return databases.map((item) => item.name)
})

export const createDatabase = connnectionProcedure
  .createServerAction()
  .input(
    z.object({
      databaseName: z.string(),
      collectionName: z.string(),
    }),
  )
  .handler(async ({ ctx, input: { databaseName, collectionName } }) => {
    await ctx.client.db(databaseName).createCollection(collectionName)

    return { databaseName, collectionName }
  })

export const removeDatabase = connnectionProcedure
  .createServerAction()
  .input(
    z.object({
      databaseName: z.string(),
    }),
  )
  .handler(async ({ ctx, input: { databaseName } }) => {
    if (['admin', 'local'].includes(databaseName)) throw new Error(`Cannot drop ${databaseName} database`)

    await ctx.client.db(databaseName).dropDatabase()

    return { databaseName }
  })
