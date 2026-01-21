import { getDb } from '@/db/db-utils';
import { createClient } from 'contentful';
import type { Product } from '@/products/product-types';
import type {
  ProductFilterArgs,
  ProductFilterOptions,
  ProductFilterResponse,
  ProductFilterSelectedOption,
} from '@/search/search-types';
import { ProductFilterKey, ProductSorting } from '@/search/search-utils';
import { cache } from 'react';

async function getProductFilterOptions() {
  const { sortings, categories } = await getDb();
  
  // Fetch price ranges from Contentful
  let priceRanges: any[] = [];
  
  try {
    const spaceId = process.env.NEXT_PUBLIC_SPACE_ID;
    const accessToken = process.env.NEXT_PUBLIC_CONTENT_DELIVERY_API;

    if (spaceId && accessToken) {
      const client = createClient({
        space: spaceId,
        accessToken: accessToken,
      });

      const filterOptionsEntries = await client.getEntries({
        content_type: 'filterOptions',
        limit: 1,
      });

      if (filterOptionsEntries.items.length > 0) {
        const filterOptionsEntry = filterOptionsEntries.items[0];
        
        // Get the price field (try different field name variations)
        const fields = filterOptionsEntry.fields as any;
        const priceFilterRef = fields.priceRanges 
          || fields.price_ranges
          || fields.price
          || fields.priceranges;

        if (priceFilterRef && priceFilterRef.sys && priceFilterRef.sys.id) {
          const priceFilterEntry = await client.getEntry(priceFilterRef.sys.id);
          const priceOptions = (priceFilterEntry.fields as any).options || [];

          // Fetch each price filter entry
          const fetchedPriceFilters = await Promise.all(
            priceOptions.map(async (option: any) => {
              try {
                const filterEntry = await client.getEntry(option.sys.id);
                return {
                  title: (filterEntry.fields as any).title || '',
                  value: (filterEntry.fields as any).value || '',
                };
              } catch (err) {
                console.error('Error fetching price filter entry:', err);
                return null;
              }
            })
          );

          // Filter out null entries
          priceRanges = fetchedPriceFilters.filter(f => f !== null);
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ Error fetching price filters from Contentful, falling back to db.json:', err);
    // Fallback to db.json if Contentful fetch fails
    const db = await getDb();
    priceRanges = db.priceRanges;
  }

  // If no price ranges found, use fallback from db.json
  if (priceRanges.length === 0) {
    const db = await getDb();
    priceRanges = db.priceRanges;
  }

  const filterOptions: ProductFilterOptions = {
    sortings: {
      title: 'Sorting',
      options: sortings.map((option, i) => ({ ...option, order: `0_${i}` })),
      filterKey: ProductFilterKey.SORTING,
    },
    categories: {
      title: 'Categories',
      options: categories.map((option, i) => ({ ...option, order: `1_${i}` })),
      filterKey: ProductFilterKey.CATEGORIES,
    },
    priceRanges: {
      title: 'Price',
      options: priceRanges.map((option, i) => ({ ...option, order: `2_${i}` })),
      filterKey: ProductFilterKey.PRICE_RANGES,
    },
  };

  return filterOptions;
}

async function getManyProducts(args: ProductFilterArgs) {
  const db = await getDb();
  let response: any = [...db.products];

  if (args.categories?.length) {
    response = response.filter((product:any) =>
      args.categories?.includes(product.category.value),
    );
  }

  if (args.priceRanges?.length) {
    const productsInPriceRanges: Product[] = [];

    for (const priceRange of args.priceRanges) {
      const [minPriceText, maxPriceText] = priceRange.split('-');
      const minPrice = Number(minPriceText);
      const maxPrice =
        maxPriceText === 'max'
          ? Number.POSITIVE_INFINITY
          : Number(maxPriceText);
      productsInPriceRanges.push(
        ...response.filter(
          (product:any) => product.price >= minPrice && product.price <= maxPrice,
        ),
      );
    }

    response = productsInPriceRanges;
  }

  if (args.sorting) {
    switch (args.sorting as ProductSorting) {
      case ProductSorting.PRICE_ASC: {
        response.sort((a:any, b:any) => a.price - b.price);
        break;
      }
      case ProductSorting.PRICE_DESC: {
        response.sort((a:any, b:any) => b.price - a.price);
        break;
      }
    }
  }

  return response;
}

function getProductFilterSelectedOptions({
  filterOptions,
  args,
}: {
  filterOptions: ProductFilterOptions;
  args: ProductFilterArgs;
}) {
  const { sortings, categories, priceRanges } = filterOptions;
  const selectedOptions: ProductFilterSelectedOption[] = [];

  let selectedSorting = sortings.options.find(
    (sorting) => sorting.value === args.sorting,
  );

  if (!selectedSorting) {
    selectedSorting = sortings.options.find(
      (sorting) => (sorting.value as ProductSorting) === ProductSorting.DEFAULT,
    );
  }

  if (selectedSorting) {
    selectedOptions.push({
      ...selectedSorting,
      isVisible:
        (selectedSorting.value as ProductSorting) !== ProductSorting.DEFAULT,
      filterKey: ProductFilterKey.SORTING,
    });
  }

  for (const category of categories.options) {
    if (args.categories?.includes(category.value)) {
      selectedOptions.push({
        ...category,
        isVisible: true,
        filterKey: ProductFilterKey.CATEGORIES,
      });
    }
  }

  for (const priceRange of priceRanges.options) {
    if (args.priceRanges?.includes(priceRange.value)) {
      selectedOptions.push({
        ...priceRange,
        isVisible: true,
        filterKey: ProductFilterKey.PRICE_RANGES,
      });
    }
  }

  return selectedOptions;
}

export const filterProducts = cache(
  async (args: ProductFilterArgs): Promise<ProductFilterResponse> => {
    const [filterOptions, products] = await Promise.all([
      getProductFilterOptions(),
      getManyProducts(args),
    ]);

    const selectedOptions = getProductFilterSelectedOptions({
      filterOptions,
      args,
    });

    return { filterOptions, selectedOptions, products };
  },
);
