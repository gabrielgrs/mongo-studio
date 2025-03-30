import { type Model, type Schema, model, models } from 'mongoose'

export function createMongooseSchema<T>(key: string, schema: Schema<T>) {
  return (models?.[key] as Model<T>) || model<T>(key, schema)
}
