import { decodeToken } from '@/libs/jose'
import { db } from '@/libs/mongoose'
import { parseData } from '@/utils/action'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { createServerActionProcedure } from 'zsa'
import { getConnection } from './helpers'

export const authProcedure = createServerActionProcedure().handler(async () => {
  const cookiesData = await cookies()

  const token = cookiesData.get('token')?.value
  if (!token) throw new Error('Unauthorized')

  const tokenData = await decodeToken(token)
  if (!tokenData) throw new Error('Unauthorized')

  const user = await db.user.findOne({ _id: tokenData._id }).lean()
  if (!user) throw new Error('Unauthorized')

  return parseData({ user })
})

export const connnectionProcedure = createServerActionProcedure(authProcedure)
  .input(z.object({ identifier: z.string(), database: z.string().optional() }))
  .handler(async ({ input: { identifier, database } }) => {
    const client = await getConnection(identifier, database)
    return { client, database }
  })
