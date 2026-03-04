import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/pdf/',
        disallow: '/pdf/api/',
      },
    ],
    sitemap: 'https://pdf.pixel-and-purpose.com/pdf/sitemap.xml',
    host: 'https://pdf.pixel-and-purpose.com',
  }
}
