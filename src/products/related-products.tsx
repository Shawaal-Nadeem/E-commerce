import type { stringDatatype } from '@/common/common-types';
import { ProductGrid } from './product-grid';

type RelatedProductsProps = {
  productId: stringDatatype;
};

export async function RelatedProducts({ parentCategory,productSlug }: any) {
  // const relatedProducts = await getRelatedProducts(productId);
  // console.log('parentCategory-> ',JSON.stringify(parentCategory.fields.productsData, null, 2));
  console.log('Slug is -> ',productSlug);
  const relatedProducts = parentCategory.fields.productsData;

  const filteredRelatedProducts = relatedProducts.filter(
    (product: any) => product.fields.slug !== productSlug
  );

  return <ProductGrid products={filteredRelatedProducts} />;
}
