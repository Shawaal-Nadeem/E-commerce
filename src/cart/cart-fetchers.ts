import type { Maybe } from '@/common/common-types';
import { getManyProductsByIds } from '@/products/product-fetchers';
import { cookies } from 'next/headers';
import { cache } from 'react';
import type { CartDetails, CartItem } from './cart-types';
import { cartSchema } from './cart-types';

export const getCart = cache(async (): Promise<Maybe<CartDetails>> => {
  const cookieStore = cookies();
  const cookieValue = cookieStore.get('cart')?.value;

  const cart = cartSchema.safeParse(
    cookieValue ? JSON.parse(cookieValue) : null,
  );

  if (!cart.success) return null;

  const productIds = cart.data.map((item) => item.productId);
  console.log('Cart Fetcher: Product IDs', productIds);

  const cartProducts = await getManyProductsByIds(productIds);
  console.log('Cart Products', cartProducts);

  const cartItems: CartItem[] = cart.data.map((item) => {
    const product = cartProducts.find((prod) => prod.fields.slug === item.productId);
    return {
      cartProducts: product,
      count: item.count,
    };
  }).filter(item => item.cartProducts); // Only keep valid products

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.cartProducts.fields.price * item.count), 0);
  const totalCount = cartItems.reduce((acc, item) => acc + item.count, 0);

  console.log('Cart Items', JSON.stringify(cartItems, null, 2));
  
  return { cartItems, totalPrice, totalCount };
});
