import { APP_URL } from '@/common/common-utils';
import { createClient } from 'contentful';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const spaceId = process.env.NEXT_PUBLIC_SPACE_ID;
  const accessToken = process.env.NEXT_PUBLIC_CONTENT_DELIVERY_API;

  const baseUrl = APP_URL;
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Dynamic product and category pages
  let dynamicPages: MetadataRoute.Sitemap = [];
  
  try {
    if (spaceId && accessToken) {
      const client = createClient({
        space: spaceId,
        accessToken: accessToken,
      });

      const ecommData = await client.getEntries({
        content_type: 'categories',
      });

      const data = ecommData.items[0];
      
      if (data?.fields) {
        const categories = (data.fields as any)?.category || [];
        
        for (const category of categories) {
          const categoryFields = category.fields as any;
          
          // Fetch products for each category
          if (categoryFields.productsData) {
            const products = await Promise.all(
              categoryFields.productsData.map(async (item: any) => {
                try {
                  return await client.getEntry(item.sys.id);
                } catch (error) {
                  console.error('Error fetching product:', error);
                  return null;
                }
              })
            );
            
            // Add product pages to sitemap
            for (const product of products) {
              if (product) {
                const productFields = product.fields as any;
                if (productFields.slug) {
                  dynamicPages.push({
                    url: `${baseUrl}/products/${productFields.slug}`,
                    lastModified: new Date(product.sys.updatedAt),
                    changeFrequency: 'weekly',
                    priority: 0.8,
                  });
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return [...staticPages, ...dynamicPages];
}
