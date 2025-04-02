import type { Metadata } from 'next'
import { APP_DESCRIPTION, APP_DOMAIN, APP_NAME } from './constants'

const meta = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
} as const

const thumb = `${APP_DOMAIN}/thumb.png`

export function generateMetadata(): Metadata {
  return {
    ...meta,
    title: {
      default: APP_NAME,
      template: `%s - ${APP_NAME}`,
    },
    twitter: {
      ...meta,
      card: 'summary_large_image',
      images: [thumb],
    },
    metadataBase: new URL(APP_DOMAIN),
    openGraph: {
      ...meta,
      images: [thumb],
    },
    icons: [
      {
        rel: 'apple-touch-icon',
        sizes: '182x182',
        url: '/apple-icon.png',
      },
    ],
  }
}
