import { Paper } from '@/common/paper';
import { ProductGrid, ProductGridSkeleton } from '@/products/product-grid';
import type { ProductFilterResponse } from './search-types';
import { Temp } from '@/app/temp';
import { createClient } from 'contentful';


type SearchResultsProps = {
  data: ProductFilterResponse;
  slugVal: string | undefined;
};

export async function SearchResults({ data, slugVal }: SearchResultsProps) {
  
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
  
  // console.log('Slug Value before Data Fetching');
  // console.log(slugVal);
  
// Check if category exists and is an array
const categories = newData?.fields?.category;

// Type assertion assuming categories is an array
let specificCategory = Array.isArray(categories)
? categories.find((category: any) => category.fields.slug === slugVal)
: undefined;

          let result = await getNestedRichData(client, specificCategory);
          (specificCategory as any).fields.productsData = result;
          specificCategory = (specificCategory as any).fields.productsData;

  return (
    <>
    {/* <Temp data = {specificCategory}/> */}
    {/* <Temp data = {data.products}/> */}
    <Paper>
      <div className="hidden group-has-[[data-pending]]/page:block">
        <ProductGridSkeleton itemCount={8} />
      </div>
      <div className="group-has-[[data-pending]]/page:hidden">
        <ProductGrid products={specificCategory} />
      </div>
    </Paper>
    </>
  );
}
