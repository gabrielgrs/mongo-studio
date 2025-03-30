import mongoose from 'mongoose'

import { session } from './schemas/session'

let connection: typeof mongoose | null = null

export const connectDatabase = async (uri = process.env.MONGODB_URI): Promise<typeof mongoose> => {
  if (connection) return connection
  connection = await mongoose.set('strictQuery', true).connect(uri)
  return connection
}

connectDatabase()

export const db = {
  session,
}
