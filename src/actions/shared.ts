'use server'

import { sendEmail } from '@/libs/resend'
import { CONTACT_EMAIL } from '@/utils/constants'
import { z } from 'zod'
import { createServerAction } from 'zsa'

export const sendContactMessage = createServerAction()
  .input(z.object({ name: z.string().optional(), email: z.string(), message: z.string(), subject: z.string() }))
  .handler(async ({ input }) => {
    return sendEmail(
      CONTACT_EMAIL,
      `Contact form`,
      `<p>From ${input.name} (${input.email}), Subject: ${input.subject}, <br/> message: ${input.message}</p>`,
    )
  })
