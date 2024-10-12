'use server';

import type { ServerActionResult } from '@/server-actions/server-action-types';
import type { ShippingInfo } from '@/shipping/shipping-utils';
import { shippingInfoSchema } from '@/shipping/shipping-utils';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Server actions should be async functions.
// eslint-disable-next-line @typescript-eslint/require-await
export async function completeCheckout(
  currentState: ServerActionResult<ShippingInfo, never> | null,
  formData: FormData,
): Promise<ServerActionResult<ShippingInfo, never>> {
  const input = {
    continentId: formData.get('continentId'),
    regionId: formData.get('regionId'),
    cityId: formData.get('cityId'),
    address: formData.get('address'),
    phone: formData.get('phone'),
    email: formData.get('email'),
  };

  console.log('------------------Entering Complete Checkout Function -----------------');

  const cookieStore = cookies();

  console.log('Deleting cart cookie');
cookieStore.delete('cart');
console.log('Redirecting to success page');
redirect('/checkout/success');

}
