import { z } from 'zod'
import { createServerActionProcedure } from 'zsa'

import { connectToDatabase } from '@/libs/mongodb'
import { db } from '@/libs/mongoose'
import { cookies } from 'next/headers'
import { decryptWithKey } from './helpers'

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

    const cookiesStore = await cookies()
    const key = cookiesStore.get('publicKey')?.value
    if (!key) throw new Error('Key not found')

    const decrypted = await decryptWithKey(key, session.connectionString)

    const client = await connectToDatabase(decrypted, input.database)

    return {
      client,
    }
  })
