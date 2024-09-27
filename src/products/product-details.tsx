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
      <div className="relative mx-auto aspect-square w-full max-w-sm md:max-w-lg">
        <Image
          className="rounded bg-white object-contain"
          src={product?.fields?.images[0]?.fields?.file?.url}
          alt={product?.fields.name}
          priority
          fill
        />
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col gap-2 text-center">
          <div className="text-3xl font-bold">{product?.fields?.name}</div>
          <div className="text-2xl">
            <Price className="text-primary" value={product?.fields?.price} />
          </div>
        </div>
        <AddProductToCartButton product={product} />
        <ProductRichDescription richDescriptions={product?.fields?.description}/>
        <NextLink
          href={routes.search({
            query: { categories: [categorySlug] },
          })}
        >
          <Chip>
            <ChipContent>{categoryName}</ChipContent>
          </Chip>
        </NextLink>
      </div>
    </div>
  );
}