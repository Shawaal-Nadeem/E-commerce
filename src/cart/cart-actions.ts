'use server';

import type { stringDatatype } from '@/common/common-types';
import { cookies } from 'next/headers';
import { getCart } from './cart-fetchers';
import type { Cart } from './cart-types';

export async function addProductToCart(productId: any) {

  const cart = await getCart();

  console.log('Before Data Push -> ', cart);
  // console.log('cartProducts ->', JSON.stringify(cart?.cartItems[0]?.cartProducts, null, 2));


  let cartItems: Cart = [];

  if (cart) {
    cartItems = cart.cartItems.map((cartItem:any) => ({
      productId: cartItem.cartProducts?.fields?.slug,
      count: cartItem.count,
    }));
  }

  console.log('Product ID -> ', productId);

  const foundInCart = cartItems.find(
    (cartItem) => cartItem.productId === productId,
  );

  if (foundInCart) {
    foundInCart.count++;
  } else {
    cartItems.push({ productId, count: 1 });
    console.log('After Data Pushed -> ', cartItems);
  }

  // for (const cartItem of cart.cartItems) {
    
    
  //   const { product } = cartItem;
  //   if (product.id !== productId) {
  //     cartItems.push({ productId: product.id, count: cartItem.count });
  //   }
  // }

  const cookieStore = cookies();

  cookieStore.set('cart', JSON.stringify(cartItems));
}

export async function decreaseProductInCart(productId: stringDatatype) {
  const cart = await getCart();

  if (!cart) return;

  // TODO: Refactor typings, fix namings (cartItems etc.)
  let cartItems: Cart = cart.cartItems.map((cartItem) => ({
    productId: cartItem?.cartProducts?.fields?.slug,
    count: cartItem.count,
  }));

  const foundInCart = cartItems.find(
    (cartItem) => cartItem.productId === productId,
  );

  if (foundInCart) {
    foundInCart.count--;

    if (foundInCart.count < 1) {
      cartItems = cartItems.filter(
        (cartItem) => cartItem.productId !== productId,
      );
    }
  }

  const cookieStore = cookies();

  if (cartItems.length) {
    cookieStore.set('cart', JSON.stringify(cartItems));
  } else {
    cookieStore.delete('cart');
  }
}

export async function removeProductFromCart(productId: stringDatatype) {
  const cart = await getCart();

  if (!cart) return;

  const cartItems: Cart = [];

  for (const cartItem of cart.cartItems) {
    const { product } = cartItem?.cartProducts;
    if (product?.fields?.slug !== productId) {
      cartItems.push({ productId: product?.fields?.slug, count: cartItem.count });
    }
  }

  const cookieStore = cookies();

  if (cartItems.length) {
    cookieStore.set('cart', JSON.stringify(cartItems));
  } else {
    cookieStore.delete('cart');
  }
}

// Server actions should be async function.
// eslint-disable-next-line @typescript-eslint/require-await
export async function clearCart() {
  const cookieStore = cookies();
  cookieStore.delete('cart');
  return { success: true };
} 