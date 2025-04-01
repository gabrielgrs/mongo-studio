import { APP_NAME, CONTACT_EMAIL } from '@/utils/constants'
import { Resend } from 'resend'

const resendClient = new Resend(process.env.RESEND_KEY)

export const getTemplate = (messages: string[]) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME} - Notification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eeeeee;
    }
    .content {
      padding: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eeeeee;
      font-size: 12px;
      color: #888888;
    }
    .footer a {
      color: #888888;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${APP_NAME}</h1>
    </div>
    <div class="content">
      ${messages.map((message) => `<p>${message}</p>`).join('')}
    </div>
    <div class="footer">
      <p>This is an automated message from ${APP_NAME}. Please do not reply to this email.</p>
      <p>If you have any questions, please contact us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
      <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`

export const sendEmail = (to: string, subject: string, html: string) =>
  resendClient.emails.send({
    from: 'noreply@sendfy.dev',
    to,
    subject,
    html,
  })

export const sendEmailAsParagraphs = (to: string, subject: string, messages: string[]) =>
  resendClient.emails.send({
    from: 'noreply@sendfy.dev',
    to,
    subject,
    html: getTemplate(messages),
  })
