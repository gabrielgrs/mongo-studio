'use server'

import { z } from 'zod'
import { createServerAction } from 'zsa'
import { getConnection } from './helpers'

export const getDatabases = createServerAction()
  .input(z.object({ identifier: z.string() }))
  .handler(async ({ input }) => {
    const client = await getConnection(input.identifier)

    const { databases } = await client.db().admin().listDatabases()

    return databases.map((item) => item.name)
  })

export const createDatabase = createServerAction()
  .input(
    z.object({
      identifier: z.string(),
      databaseName: z.string(),
      collectionName: z.string(),
    }),
  )
  .handler(async ({ input: { identifier, databaseName, collectionName } }) => {
    const client = await getConnection(identifier)
    await client.db(databaseName).createCollection(collectionName)

    return { databaseName, collectionName }
  })

export const removeDatabase = createServerAction()
  .input(
    z.object({
      identifier: z.string(),
      databaseName: z.string(),
    }),
  )
  .handler(async ({ input: { identifier, databaseName } }) => {
    if (['admin', 'local'].includes(databaseName)) throw new Error(`Cannot drop ${databaseName} database`)

    const client = await getConnection(identifier)
    await client.db(databaseName).dropDatabase()

    return { databaseName }
  })
