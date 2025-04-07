import { WithId } from 'mongodb'
import { Schema } from 'mongoose'
import { createMongooseSchema } from '../helpers'

export type Session = WithId<{
  email: string
  code: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}>

const ONE_MINUTE = 60

export const session = createMongooseSchema<Session>(
  'Session',
  new Schema<Session>(
    {
      email: {
        type: String,
        required: true,
      },
      code: {
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
