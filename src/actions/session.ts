'use server'

import { db } from '@/libs/mongoose'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { createServerAction } from 'zsa'
import { encryptWithKey, testConnection } from './helpers'

export const generateSession = createServerAction()
  .input(z.string())
  .handler(async ({ input: uri }) => {
    await testConnection(uri)

    const cookiesStore = await cookies()
    const key = cookiesStore.get('publicKey')?.value

    if (!key) throw new Error('Key not found')

    const value = await encryptWithKey(key, uri)

    const session = await db.session.create({
      connectionString: value,
    })

    return session._id.toString()
  })
