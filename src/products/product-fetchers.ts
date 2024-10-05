import type { stringDatatype } from '@/common/common-types';
import { getDb } from '@/db/db-utils';
import { cache } from 'react';
import { createClient } from 'contentful';


export const getOneProductById = cache(async (productId: stringDatatype) => {
  // const db = await getDb();
  // const product = db.products.find((product) => product.id === productId);
  // return product;
});

export const getManyProductsByIds = cache(async (productIds: stringDatatype[]) => {
  // const db = await getDb();
  // const products = db.products.filter((product) =>
  //   productIds.includes(product.id),
  // );
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
  async function processCategories(client: any, newData: any) {
    if (newData?.fields?.category) {
      for (const item of newData?.fields?.category) {
        const result = await getNestedRichData(client, item);
        item.fields.productsData = result;
      }
    }
    return newData;
  }

  newData = await processCategories(client, newData);


  // console.log('Product IDs Array -> ', productIds);

// Initialize an array to hold all matched products
let specificProducts: any[] = [];

// Find all products that match any of the productIds
const matchedProducts = newData?.fields?.category?.flatMap((category: any) => 
  category.fields.productsData.filter((product: any) => 
    productIds.some((productId) => product.fields.slug === productId) // Check if any productId matches the slug
  )
);

// Extend specificProducts by adding new matched products (if any)
if (matchedProducts) {
  specificProducts = [...specificProducts, ...matchedProducts];
}

// console.log('specificProducts:', specificProducts);

  return specificProducts;
});

