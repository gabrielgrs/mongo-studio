import { WithId } from 'mongodb'
import { Schema } from 'mongoose'
import { createMongooseSchema } from '../helpers'

export type UserSchema = WithId<{
  email: string
  name?: string
  connectionStrings: string[]
  role: 'ADMIN' | 'USER'
  createdAt: Date
  updatedAt: Date
}>

export const user = createMongooseSchema<UserSchema>(
  'User',
  new Schema<UserSchema>(
    {
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      },
      name: {
        type: String,
        required: false,
      },
      connectionStrings: {
        type: [String],
        default: [],
        select: false,
      },
      role: {
        type: String,
        enum: ['ADMIN', 'USER'],
        default: 'USER',
      },
    },
    {
      timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    },
  ),
)
