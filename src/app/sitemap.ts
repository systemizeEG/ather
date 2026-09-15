import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ather.store'
 
  // Get all products to include in sitemap
  const products = await prisma.product.findMany({
    select: { slug: true, updatedAt: true }
  })

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  })

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/store/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))
 
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/store`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...productEntries,
    ...categoryEntries,
  ]
}
