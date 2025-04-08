import { z } from 'zod'
import { createServerActionProcedure } from 'zsa'

import { connectToDatabase } from '@/libs/mongodb'
import { db } from '@/libs/mongoose'

export const connectionProcedure = createServerActionProcedure()
  .input(
    z.object({
      identifier: z.string(),
      database: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const session = await db.session.findOne({ _id: input.identifier })
    if (!session) throw new Error('Session not found')

    const client = await connectToDatabase(session.connectionString, input.database)

    return {
      client,
    }
  })
