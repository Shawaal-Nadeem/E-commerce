import { Price } from '@/common/price';
import { Skeleton } from '@/common/skeleton';
import { Tooltip } from '@/common/tooltip';
import { NextLink } from '@/routing/next-link';
import { routes } from '@/routing/routing-utils';
import Image from 'next/image';
import type { Product } from './product-types';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <NextLink
      href={routes.product({ params: { productId: product?.fields?.slug } })}
      // To show outline when the link is `focus-visible`.
      className="block"
    >
      <article className="group flex flex-col gap-2 rounded-2xl border-2 border-yellow-100 dark:border-yellow-900/30 p-2 md:p-4 bg-white dark:bg-stone-900/50 shadow-sm hover:shadow-xl hover:border-yellow-400 transition-all duration-300">
        <div className="p-2">
          <div className="relative aspect-[12/10] bg-white transition duration-500 ease-out group-hover:scale-105">
            <Image
              className="rounded-xl object-contain"
              src={product?.fields?.images[0]?.fields?.file?.url}
              alt={product?.fields?.name}
              fill
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 text-center">
          <Tooltip content={product?.fields?.name}>
            <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 fixed-leading-5 fixed-line-clamp-2 px-2">
              {product?.fields?.name}
            </h3>
          </Tooltip>
          <div className="mt-auto pb-2">
            <Price className="text-yellow-600 dark:text-yellow-400 text-lg font-extrabold" value={product?.fields?.price} />
          </div>
        </div>
      </article>
    </NextLink>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-md border-2 p-2 md:p-4">
      <div className="p-2">
        <Skeleton className="aspect-[12/10]" />
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="flex w-full flex-col items-center gap-1">
          <Skeleton className="h-4 w-full max-w-[theme(spacing.28)]" />
          <Skeleton className="h-4 w-full max-w-[theme(spacing.36)]" />
          <Skeleton className="h-4 w-full max-w-[theme(spacing.28)]" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}
