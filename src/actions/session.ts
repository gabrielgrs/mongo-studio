'use server'

import { db } from '@/libs/mongoose'
import { z } from 'zod'
import { createServerAction } from 'zsa'
import { testConnection } from './helpers'

export const generateSession = createServerAction()
  .input(z.string())
  .handler(async ({ input: uri }) => {
    await testConnection(uri)

    const session = await db.session.create({
      connectionString: uri,
    })

    return session._id.toString()
  })
