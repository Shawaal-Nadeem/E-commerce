'use client';

import { AnimatePresence } from '@/animations/animate-presence';
import { Price } from '@/common/price';
import { NextLink } from '@/routing/next-link';
import { routes } from '@/routing/routing-utils';
import { motion } from 'framer-motion';
import { twJoin } from 'tailwind-merge';
import { CartItemActionButtons } from './cart-item-actions-buttons';
import type { CartItem } from './cart-types';

export type CartItemListContentProps = {
  isDense?: boolean;
  cartItems: CartItem[];
};

export function CartItemListContent({
  isDense,
  cartItems,
}: CartItemListContentProps) {
  // AnimatePresence works the same way with multiple children.
  // Just ensure that each has a unique key and components will animate in
  // and out as they're added or removed from the tree.
  // https://www.framer.com/motion/animate-presence/##multiple-children

  // console.log('Cart Items');
  // console.log(cartItems);
  return (
    <AnimatePresence>
      {cartItems?.map((cartItem: any, index: number) => {
        // cartProducts appears to be an object, not an array.
        const product = cartItem?.cartProducts;

        if (!product) {
          return null; // Guard clause in case there's no product
        }

        return (
          <li
            key={index} // Unique key
            className={twJoin('border-b-2 p-6', isDense && 'px-4 py-3')}
          >
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex gap-4">
                <NextLink
                  href={routes.product({
                    params: { productId: product?.fields?.slug },
                  })}
                  className="line-clamp-3 flex-grow font-semibold"
                >
                  {product?.fields?.name} {/* Display product name */}
                </NextLink>
                <div className="flex flex-col items-end">
                  <Price
                    className="text-primary"
                    value={product?.fields?.price * cartItem.count} 
                  />
                </div>
              </div>
              <div className="mt-2">
                <CartItemActionButtons cartItem={cartItem} />
              </div>
            </motion.div>
          </li>
        );
      })}
    </AnimatePresence>
  );
}