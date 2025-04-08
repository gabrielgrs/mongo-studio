import { getDomain } from '@/utils/action/server'
import { APP_DESCRIPTION, APP_NAME } from '@/utils/constants'
import { MetadataRoute } from 'next'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const domain = await getDomain()

  return {
    name: `${APP_NAME} App`,
    short_name: APP_NAME,
    description: `${APP_NAME} - ${APP_DESCRIPTION}`,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: `${domain}/android-chrome-192x192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: `${domain}/android-chrome-512x512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
