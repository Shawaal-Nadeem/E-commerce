import { createMockArray } from '@/common/common-utils';
import { ProductCard, ProductCardSkeleton } from './product-card';
import type { Product } from './product-types';
import { Temp } from '@/app/temp';

type ProductGridShellProps = React.PropsWithChildren;

function ProductGridShell({ children }: ProductGridShellProps) {
  return (
    <ul className="grid gap-2 grid-cols-autofill-44 md:gap-4">{children}</ul>
  );
}


export function ProductGrid({ products }: any) {

  return (
    <ProductGridShell>
      {/* <Temp data = {products}/> */}
      {products?.map((product:any, index:number) => {
        return (
          <li key={index}>
            <ProductCard product={product} />
          </li>
        );
      })}
    </ProductGridShell>
  );
}

type ProductGridSkeletonProps = {
  itemCount: number;
};

export function ProductGridSkeleton({ itemCount }: ProductGridSkeletonProps) {
  return (
    <ProductGridShell>
      {createMockArray(itemCount).map((i) => {
        return (
          <li key={i}>
            <ProductCardSkeleton />
          </li>
        );
      })}
    </ProductGridShell>
  );
}
