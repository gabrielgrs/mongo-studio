'use server'

import { connectToDatabase } from '@/libs/mongodb'
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
  .input(z.object({ uri: z.string(), database: z.string(), collection: z.string(), page: z.number() }))
  .handler(async ({ input: { uri, database, collection, page } }) => {
    const client = await connectToDatabase(uri, database)

    const totalItems = await client.db().collection(collection).countDocuments()
    const collectionData = await client
      .db()
      .collection(collection)
      .find()
      .limit(page * ITEMS_PER_PAGE)
      .toArray()

    const response = { data: collectionData, totalItems, identifier: `${database}.${collection}` }
    return JSON.parse(JSON.stringify(response)) as typeof response
  })

async function executeMongoQuery(db: any, rawQuery: string) {
  // Extrai a coleção da query
  const match = rawQuery.match(/db\.getCollection\(['"`](.+?)['"`]\)\.(\w+)\(([\s\S]*)\)/)

  if (!match) throw new Error('Formato de query inválido')

  const [, collectionName, operation, params] = match
  const collection = db.collection(collectionName)

  // Converte os parâmetros para JSON válido
  const parsedParams = params ? JSON.parse(params) : {}

  if (operation === 'find') return collection.find(parsedParams).toArray()
  if (operation === 'findOne') return collection.findOne(parsedParams)
  if (operation === 'count') return collection.countDocuments(parsedParams)
  if (operation === 'aggregate') return collection.aggregate(parsedParams).toArray()
  if (operation === 'insert') return collection.insertOne(parsedParams)

  throw new Error(`Operation ${operation} not allowed`)

  // switch (operation) {
  //   case 'find':
  //     return await collection.find(parsedParams).toArray();
  //   case 'insertOne':
  //     return await collection.insertOne(parsedParams);
  //   case 'insertMany':
  //     return await collection.insertMany(parsedParams);
  //   case 'updateOne':
  //     return await collection.updateOne(parsedParams.filter, parsedParams.update);
  //   case 'updateMany':
  //     return await collection.updateMany(parsedParams.filter, parsedParams.update);
  //   case 'deleteOne':
  //     return await collection.deleteOne(parsedParams);
  //   case 'deleteMany':
  //     return await collection.deleteMany(parsedParams);
  //   default:
  //     throw new Error(`Operação ${operation} não suportada`);
  // }
}

export const executeRawQuery = createServerAction()
  .input(z.object({ uri: z.string(), database: z.string(), query: z.string() }))
  .handler(async ({ input: { uri, database, query } }) => {
    const client = await connectToDatabase(uri, database)

    return executeMongoQuery(client.db, query)
  })
