import { PageTitle } from '@/common/page-title';
import { Paper } from '@/common/paper';
import { Section, SectionTitle } from '@/common/section';
import { ProductDetails } from '@/products/product-details';
import { getOneProductById } from '@/products/product-fetchers';
import { ProductGridSkeleton } from '@/products/product-grid';
import { RelatedProducts } from '@/products/related-products';
import { getMetadata } from '@/seo/seo-utils';
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

// export async function generateMetadata({
//   params,
// }: ProductPageProps): Promise<Metadata> {
//   const product = await getOneProductById(Number(params.productId));

//   if (!product) notFound();

//   return getMetadata({
//     title: product.title,
//     description: product.description,
//     pathname: `/products/${params.productId}`,
//     images: [{ url: product.image, alt: product.title }],
//   });
// }

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
    category.fields.productsData.filter((product: any) => 
      product.fields.slug === slugValue // Match productData slug
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

  return (
      // <Temp data = {specificProduct}/>
    <div className="flex flex-col gap-4">
      <main>
        <PageTitle title={specificProduct?.fields?.name} />
        <Paper>
          <ProductDetails product={specificProduct} categorySlug={parentCategory?.fields?.slug} categoryName={parentCategory?.fields?.categoryName} />
        </Paper>
      </main>
      {/* <Section as="aside">
        <SectionTitle as="h2">Related Products</SectionTitle>
        <Paper>
          <Suspense fallback={<ProductGridSkeleton itemCount={6} />}>
            <RelatedProducts productId={productId} />
          </Suspense>
        </Paper>
      </Section> */}
    </div>
  );
}
