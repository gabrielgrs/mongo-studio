import { getDomain } from '@/utils/action/server'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const domain = await getDomain()

  return [
    {
      url: domain,
      lastModified: new Date(),
    },
  ]
}
