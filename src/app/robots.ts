import { getDomain } from '@/utils/action/server'
import { MetadataRoute } from 'next'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const domain = await getDomain()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${domain}/sitemap.xml`,
  }
}
