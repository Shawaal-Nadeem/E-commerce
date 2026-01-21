import { Paper } from '@/common/paper';
import { ProductGrid, ProductGridSkeleton } from '@/products/product-grid';
import type { ProductFilterResponse } from './search-types';
import { Temp } from '@/app/temp';
import { createClient } from 'contentful';


type SearchResultsProps = {
  data: ProductFilterResponse;
  slugVal: string | undefined;
};

export async function SearchResults({ slugVal, priceRangeArr, sortingVal }: any) {
  // console.log('Price Range Value');
  // console.log(priceRangeArr);
  // console.log('Sorting Value');
  // console.log(sortingVal);
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
    newData = ecommData.items; // Fetch all entries, not just the first one
  } catch (err) {
    console.error('Error fetching data:', err);
  }

  // console.log('Slug Value before Data Fetching:', slugVal);
  
  // Check if category exists and is an array
  const categories = newData?.map(item => item.fields.category).flat(); // Flatten categories from multiple entries

  let specificCategory = undefined;
  
  if (slugVal) {
    // If a slugVal is provided, find the specific category
    specificCategory = Array.isArray(categories)
      ? categories.find((category: any) => category.fields.slug === slugVal)
      : undefined;

    if (specificCategory) {
      const result = await getNestedRichData(client, specificCategory);
      (specificCategory as any).fields.productsData = result;
      specificCategory = (specificCategory as any).fields.productsData;
    }
  } else {
    // If no slugVal, fetch products for all categories
    if (Array.isArray(categories)) {
      const allProductsData = await Promise.all(
        categories.map(async (category: any) => {
          const result = await getNestedRichData(client, category);
          category.fields.productsData = result;
          return category.fields.productsData;
        })
      );
      specificCategory = allProductsData.flat(); // Combine all category products into one array
      // console.log('All Products Data:', specificCategory);
    } else {
      console.error('Categories is not an array');
      specificCategory = []; // Set to an empty array to avoid further errors
    }
  }

  // console.log('Specific Category:', specificCategory);
  let filteredItems = specificCategory;
if (Array.isArray(priceRangeArr) && priceRangeArr.length > 0 && priceRangeArr.every(range => range !== undefined)) {

  const flatPriceRangeArr = priceRangeArr.flat();
  const parsedRanges = flatPriceRangeArr.map(range => {
    if (typeof range !== 'string') {
      console.error('Unexpected non-string value in priceRangeArr:', range);
      return null;
    }

    const [minStr, maxStr] = range.split('-');
    const min = Number(minStr);
    const max = maxStr === 'max' || !maxStr ? Infinity : Number(maxStr);
    return { min, max };
  }).filter(Boolean);

  // Update filter to include explicit typing for 'item'
  filteredItems = specificCategory.filter((item: { fields: { price: number } }) => {
    const itemPrice = item.fields.price;
  
    return parsedRanges.some((range) => {
      // Ensure range and its min and max are properly defined
      if (range && typeof range.min === 'number' && typeof range.max === 'number') {
        return itemPrice >= range.min && itemPrice <= range.max;
      }
      return false; // Ignore ranges that are not properly defined
    });
  });
  

} else {
  console.warn('priceRangeArr is not an array or contains undefined values:', priceRangeArr);
}

// Sorting with explicit types
if (sortingVal !== undefined) {
  if (sortingVal === 'price-asc') {
    filteredItems.sort((a: { fields: { price: number } }, b: { fields: { price: number } }) => a.fields.price - b.fields.price);
  } else if (sortingVal === 'price-desc') {
    filteredItems.sort((a: { fields: { price: number } }, b: { fields: { price: number } }) => b.fields.price - a.fields.price);
  }
}

  
  return (
    <>
    <Temp data = {categories}/>
    {/* <Temp data = {data.products}/> */}
    <Paper>
      <div className="hidden group-has-[[data-pending]]/page:block">
        <ProductGridSkeleton itemCount={8} />
      </div>
      <div className="group-has-[[data-pending]]/page:hidden">
        <ProductGrid products={filteredItems} />
      </div>
    </Paper>
    </>
  );
}
