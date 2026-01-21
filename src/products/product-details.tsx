import { AddProductToCartButton } from '@/cart/add-to-cart-button';
import { Chip, ChipContent } from '@/common/chip';
import { Price } from '@/common/price';
import { NextLink } from '@/routing/next-link';
import { routes } from '@/routing/routing-utils';
import Image from 'next/image';
import type { Product } from './product-types';
import ProductRichDescription from './richDescription';



export function ProductDetails({ product, categorySlug, categoryName }: any) {

  // console.log('specificProduct:', product);
  // console.log('categorySlug:', categorySlug);
  // console.log('categoryName:', categoryName);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="relative mx-auto aspect-square w-full max-w-sm md:max-w-lg overflow-hidden rounded-3xl border-2 border-yellow-100 dark:border-yellow-900/30 bg-white p-4 shadow-2xl">
        <Image
          className="object-contain"
          src={product?.fields?.images[0]?.fields?.file?.url}
          alt={product?.fields.name}
          priority
          fill
        />
      </div>
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-800 bg-clip-text text-transparent">
            {product?.fields?.name}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Price className="text-3xl sm:text-4xl font-extrabold text-yellow-600 dark:text-yellow-400" value={product?.fields?.price} />
          </div>
        </div>
        
        <div className="w-full max-w-xs">
          <AddProductToCartButton product={product} />
        </div>

        <div className="w-full border-t border-yellow-200 dark:border-yellow-800 pt-6">
          <ProductRichDescription richDescriptions={product?.fields?.description}/>
        </div>

        <NextLink
          href={routes.search({
            query: { categories: [categorySlug] },
          })}
          className="hover:scale-105 transition-transform"
        >
          <Chip className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/40 dark:to-stone-900/40 border-yellow-200 dark:border-yellow-700">
            <ChipContent className="text-yellow-800 dark:text-yellow-200 font-semibold uppercase tracking-wider text-xs">
              {categoryName}
            </ChipContent>
          </Chip>
        </NextLink>
      </div>
    </div>
  );
}