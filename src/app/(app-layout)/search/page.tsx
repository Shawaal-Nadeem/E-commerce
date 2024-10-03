import { Temp } from '@/app/temp';
import { PageTitle } from '@/common/page-title';
import { Section, SectionTitle } from '@/common/section';
import { ProductFilter } from '@/search/product-filter';
import { ProductFilterDrawer } from '@/search/product-filter-drawer';
import { filterProducts } from '@/search/search-fetchers';
import { SearchResults } from '@/search/search-results';
import { SelectedFilters } from '@/search/selected-filters';
import { SelectedOptionsProvider } from '@/search/selected-options-context';
import { getMetadata } from '@/seo/seo-utils';
import { z } from 'zod';

export const metadata = getMetadata({
  title: 'Search Products',
  pathname: '/search',
});

const singleValueSchema = z
  .string()
  .or(z.array(z.string()).transform((value) => value[0]))
  .optional();

const multipleValuesSchema = z
  .string()
  .transform((value) => [value])
  .or(z.array(z.string()))
  .optional();

const searchParamsSchema = z.object({
  categories: multipleValuesSchema,
  priceRanges: multipleValuesSchema,
  sorting: singleValueSchema,
});

type SearchPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};


export default async function SearchPage({ searchParams }: SearchPageProps) {

  const data = await filterProducts(searchParamsSchema.parse(searchParams));
  
  // console.log('Slug URL Value');
  // console.log(searchParams);

  // Handle slugVal to ensure it's always a string
  let slugVal: string | undefined;
  if (Array.isArray(searchParams.categories)) {
    slugVal = searchParams.categories.length > 0 ? searchParams.categories[0] : undefined;
  } else {
    slugVal = searchParams.categories || undefined; // It could also be a string or undefined
  }
  
  let priceRangeArr:any = [searchParams.priceRanges];
  let sortingVal:any = searchParams.sorting;
  
  return (
    <main className="group/page">
      <PageTitle title="Search Products" srOnly />
      <SelectedOptionsProvider data={data}>
        <div className="grid gap-2 md:grid-cols-[theme(spacing.72)_1fr]">
          <Section className="sticky top-24 hidden max-h-[80vh] overflow-auto px-2 md:block">
            <SectionTitle as="h2" srOnly>
              Filter
            </SectionTitle>

            <ProductFilter data={data} />

          </Section>
          <Section>
            <SectionTitle as="h2" srOnly>
              Search Results
            </SectionTitle>
            <div className="flex flex-col gap-2">
              <SelectedFilters />
              <ProductFilterDrawer>
                <ProductFilter data={data} />
              </ProductFilterDrawer>
              <SearchResults slugVal={slugVal} priceRangeArr={priceRangeArr} sortingVal={sortingVal}/>
            </div>
          </Section>
        </div>
      </SelectedOptionsProvider>
    </main>
  );
}
