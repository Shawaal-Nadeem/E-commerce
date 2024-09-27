import { SubmitButton } from '@/forms/submit-button';
import type { Product } from '@/products/product-types';
import { addProductToCart } from './cart-actions';
import { Temp } from '@/app/temp';

type AddProductToCartButtonProps = {
  className?: string;
  product: any;
};

export function AddProductToCartButton({
  product,
}: any) {
  const addProductToCartWithId = addProductToCart.bind(null, product?.fields.slug);

  return (
    <form action={addProductToCartWithId} className="w-full max-w-xs">
      {/* <Temp data = {product}/> */}
      <SubmitButton variant="primary" className="w-full">
        Add to Cart
      </SubmitButton>
    </form>
  );
}