import { DeleteIcon, MinusIcon, PlusIcon } from '@/common/icons';
import { SubmitButton } from '@/forms/submit-button';
import {
  addProductToCart,
  decreaseProductInCart,
  removeProductFromCart,
} from './cart-actions';
import type { CartItem } from './cart-types';

type CartItemActionButtonsProps = {
  cartItem: CartItem;
};

export function CartItemActionButtons({
  cartItem,
}: CartItemActionButtonsProps) {
  console.log('cartItem', cartItem);
  const  product  = cartItem?.cartProducts;
  const addProductToCartWithId = addProductToCart.bind(null, product?.fields?.slug);
  const decreaseProductInCartWithId = decreaseProductInCart.bind(
    null,
    product?.fields?.slug,
  );
  const removeProductFromCartWithId = removeProductFromCart.bind(
    null,
    product?.fields?.slug,
  );

  return (
    <div className="flex items-center justify-between">
      <form action={removeProductFromCartWithId}>
        <SubmitButton
          aria-label={`Remove "${product?.fields?.name}" From Cart`}
          className="h-8 w-8 rounded-md text-sm"
          icon={<DeleteIcon size="1.2rem" />}
        />
      </form>
      <div className="flex items-center">
        <form action={decreaseProductInCartWithId}>
          <SubmitButton
            aria-label={`Decrease "${product?.fields?.name}" Count in Cart`}
            className="h-8 w-8 rounded-l-md rounded-r-none text-sm"
            variant="primary"
            icon={<MinusIcon size="1.2rem" />}
          />
        </form>
        <div className="grid h-8 w-8 cursor-default select-none place-items-center border-2 text-sm">
          {cartItem.count}
        </div>
        <form action={addProductToCartWithId}>
          <SubmitButton
            aria-label={`Increase "${product?.fields?.name}" Count in cart`}
            className="h-8 w-8 rounded-l-none rounded-r-md text-sm"
            variant="primary"
            icon={<PlusIcon size="1.2rem" />}
          />
        </form>
      </div>
    </div>
  );
}