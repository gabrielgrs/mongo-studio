'use server'

import { createToken } from '@/libs/jose'
import { db } from '@/libs/mongoose'
import { sendEmailAsParagraphs } from '@/libs/resend'
import { parseData } from '@/utils/action'
import { APP_NAME } from '@/utils/constants'
import dayjs from 'dayjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServerAction } from 'zsa'
import { authProcedure } from './procedures'

type RequiredUserFields = {
  name?: string
}

export async function createOrFindUser(email: string, fields: RequiredUserFields) {
  const user = await db.user.findOne({ email })
  if (user) return user

  if (!fields.name) return null

  return db.user.create({
    email,
    name: fields.name,
  })
}

export const authenticate = createServerAction()
  .input(
    z.object({
      email: z.string(),
      code: z.string().optional(),
      name: z.string().optional(),
      username: z.string().optional(),
    }),
  )
  .handler(async ({ input }): Promise<{ status: 'AUTHORIZED' | 'WAITING_FOR_CODE' | 'SHOULD_REGISTER' }> => {
    const userCreationResponse = await createOrFindUser(input.email, {
      name: input.name,
    })

    if (!userCreationResponse)
      return {
        status: 'SHOULD_REGISTER',
      }

    if (!userCreationResponse) {
      return { status: 'SHOULD_REGISTER' }
    }

    if (!input.code) {
      const session = await db.session.findOne({ email: input.email })
      if (session) {
        const currentTime = dayjs()
        const sessionTime = dayjs(session.createdAt)
        const diffTime = currentTime.diff(sessionTime, 'seconds')

        const SECONDS_BEFORE_NEW_TRY = 180

        if (diffTime < SECONDS_BEFORE_NEW_TRY) {
          throw new Error(`Wait ${SECONDS_BEFORE_NEW_TRY - diffTime} seconds before trying again`)
        }
      }

      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()
      await db.session.deleteMany({ email: input.email })
      await db.session.create({ email: userCreationResponse.email, code: generatedCode })
      await sendEmailAsParagraphs(input.email, `${APP_NAME} verification code is ${generatedCode}`, [
        `Hello!`,
        'Here is your verification code',
        `<strong>${generatedCode}</strong>`,
      ])
      return {
        status: 'WAITING_FOR_CODE',
      }
    }

    const isValidCode = await db.session.findOne({ email: input.email, code: input.code })

    if (!isValidCode) throw new Error('Unauthorized')

    const token = await createToken({
      _id: userCreationResponse._id,
      role: userCreationResponse.role,
    })

    return redirect(`/auth?token=${token}`)
  })

export const getAuthenticatedUser = authProcedure.createServerAction().handler(async ({ ctx }) => {
  return parseData(ctx.user)
})

export const signOut = createServerAction().handler(async () => {
  const cookiesData = await cookies()

  cookiesData.delete('token')

  return true
})

export const updateUser = authProcedure
  .createServerAction()
  .input(z.object({ name: z.string().nonempty() }))
  .handler(async ({ input, ctx }) => {
    await db.user.findOneAndUpdate(
      { _id: ctx.user._id },
      {
        name: input.name,
      },
    )

    return true
  })
