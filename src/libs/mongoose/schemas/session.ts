import { WithId } from 'mongodb'
import { Schema } from 'mongoose'
import { createMongooseSchema } from '../helpers'

export type Session = WithId<{
  connectionString: string
  ip: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}>

const ONE_MINUTE = 60

export const session = createMongooseSchema<Session>(
  'Session',
  new Schema<Session>(
    {
      connectionString: {
        type: String,
        required: true,
      },
      ip: {
        type: String,
        required: true,
      },
      expiresAt: {
        type: Date,
        expires: 30 * ONE_MINUTE,
        default: Date.now,
      },
    },
    {
      timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    },
  ),
)
