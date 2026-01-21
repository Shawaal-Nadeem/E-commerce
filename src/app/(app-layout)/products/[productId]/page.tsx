import { PageTitle } from '@/common/page-title';
import { Paper } from '@/common/paper';
import { Section, SectionTitle } from '@/common/section';
import { ProductDetails } from '@/products/product-details';
import { getOneProductById } from '@/products/product-fetchers';
import { ProductGridSkeleton } from '@/products/product-grid';
import { RelatedProducts } from '@/products/related-products';
import { getMetadata, getProductSchema } from '@/seo/seo-utils';
import { APP_URL } from '@/common/common-utils';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from 'contentful';
import { Temp } from '@/app/temp';


export type ProductPageProps = {
  params: {
    productId: string;
  };
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const slugValue = params.productId;
  const spaceId = process.env.NEXT_PUBLIC_SPACE_ID;
  const accessToken = process.env.NEXT_PUBLIC_CONTENT_DELIVERY_API;
  
  const client = createClient({
    space: spaceId as string,
    accessToken: accessToken as string,
  });
  
  try {
    const ecommData = await client.getEntries({
      content_type: 'categories',
    });
    const data = ecommData.items[0];
    
    // Find the product with matching slug
    for (const category of (data?.fields as any)?.category || []) {
      const productsData = await Promise.all(
        (category.fields as any).productsData?.map(async (item: any) => {
          return await client.getEntry(item.sys.id);
        }) || []
      );
      
      const product = productsData.find((p: any) => 
        (p.fields as any)?.slug === slugValue
      );
      
      if (product) {
        const productFields = product.fields as any;
        const categoryFields = category.fields as any;
        const productName = productFields.name || 'Product';
        const productPrice = productFields.price || 0;
        const categoryName = categoryFields.categoryName || categoryFields.name || 'Jewelry';
        const imageUrl = productFields.images?.[0]?.fields?.file?.url || '/images/logo.png';
        const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `https:${imageUrl}`;
        
        return getMetadata({
          title: `${productName} | ${categoryName} | Arif Jewellers`,
          description: `Shop ${productName} at Arif Jewellers. Premium ${categoryName.toLowerCase()} crafted with finest materials. PKR ${productPrice.toLocaleString()}. Buy luxury jewelry online in Pakistan.`,
          pathname: `/products/${slugValue}`,
          images: [{ url: fullImageUrl, alt: productName }],
          keywords: [
            productName,
            categoryName,
            `${categoryName} Pakistan`,
            'luxury jewelry',
            'buy jewelry online Pakistan',
          ],
        });
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  // Fallback metadata
  return getMetadata({
    title: 'Product | Arif Jewellers',
    description: 'Discover exquisite jewelry at Arif Jewellers Pakistan',
    pathname: `/products/${slugValue}`,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {

  async function getNestedRichData(client: any, section: any) {
    if (section && section.fields?.productsData) {
      const productsData = await Promise.all(
        section.fields.productsData.map(async (item: any) => {
          const entry = await client.getEntry(item.sys.id);
          return entry;
        })
      );

      return productsData;
    }
  }

  // const productId = Number(params.productId);
  // const product = await getOneProductById(productId);
  // console.log('Past Product Data:', product);

  const slugValue = params.productId;
  // console.log('Dynamic Page');
  // console.log(slugValue);

  const spaceId = process.env.NEXT_PUBLIC_SPACE_ID;
  const accessToken = process.env.NEXT_PUBLIC_CONTENT_DELIVERY_API;
  
  const client = createClient({
    space: spaceId as string,
    accessToken: accessToken as string,
  });
  
  let newData = null;
  
  try {
    const ecommData = await client.getEntries({
      content_type: 'categories',
    });
    newData = ecommData.items[0];
  } catch (err) {
    console.error('Error fetching data:', err);
  } 

  async function processCategories(client: any, newData: any) {
    if (newData?.fields?.category) {
      for (const item of newData.fields.category) {
        const result = await getNestedRichData(client, item);
        item.fields.productsData = result;
      }
    }
    return newData;
  }

  newData = await processCategories(client, newData);



  const specificProduct = newData?.fields?.category?.flatMap((category: any) => 
    category?.fields?.productsData?.filter((product: any) => 
      product?.fields?.slug === slugValue // Match productData slug
    )
  ).find((product: any) => product); // Get the first matched product
  
  // console.log('specificProduct:', specificProduct);

  // Get Category slug of the product where slug matches in productsData
  let parentCategory = null;
  for (const category of newData?.fields?.category || []) {
    const product = category.fields.productsData.find((product: any) => 
      product.fields.slug === slugValue // Match productData slug
    );
    if (product) {
      parentCategory = category; // Save the parent category
      break; // Stop searching after the first match
    }
  }
  // console.log('Parent Category:', parentCategory);

  // if (!product) notFound();

  // Generate product schema for SEO
  const productSchema = specificProduct ? getProductSchema({
    name: specificProduct.fields.name,
    description: specificProduct.fields.description?.content?.[0]?.content?.[0]?.value || specificProduct.fields.name,
    price: specificProduct.fields.price,
    currency: 'PKR',
    image: specificProduct.fields.images?.[0]?.fields?.file?.url ? 
      `https:${specificProduct.fields.images[0].fields.file.url}` : 
      `${APP_URL}/images/logo.png`,
    url: `${APP_URL}/products/${slugValue}`,
    category: parentCategory?.fields?.categoryName || parentCategory?.fields?.name || 'Jewelry',
  }) : null;

  return (
      // <Temp data = {specificProduct}/>
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema),
          }}
        />
      )}
      <div className="flex flex-col gap-4">
        <main>
          <PageTitle title={specificProduct?.fields?.name} />
          <Paper>
            <ProductDetails product={specificProduct} categorySlug={parentCategory?.fields?.slug} categoryName={parentCategory?.fields?.categoryName} />
          </Paper>
        </main>
        <Section as="aside">
          <SectionTitle as="h2">Related Products</SectionTitle>
          <Paper>
            <Suspense fallback={<ProductGridSkeleton itemCount={6} />}>
              <RelatedProducts parentCategory={parentCategory} productSlug={specificProduct?.fields?.slug}/>
            </Suspense>
          </Paper>
        </Section>
      </div>
    </>
  );
}
