import type { Nil } from './common-types';

export const APP_URL = 'https://www.arifjewellery.com';
export const APP_TITLE = 'Arif Jewellers';
export const APP_DESCRIPTION = 'Discover timeless elegance and exquisite craftsmanship in fine jewelry. Shop luxury necklaces, bangles, rings, and earrings at Arif Jewellers - Pakistan\'s premier jewelry destination.';
export const APP_REPOSITORY_URL = 'https://github.com/Shawaal-Nadeem';
export const BUSINESS_NAME = 'Arif Jewellers';
export const BUSINESS_PHONE = '+92-305-2333381'; // Update with actual phone
export const BUSINESS_EMAIL = 'info@arifjewellery.com';
export const BUSINESS_ADDRESS = 'Pakistan'; // Update with actual address

export const createMockArray = (length: number) => {
  // eslint-disable-next-line unicorn/prefer-spread
  return Array.from(Array.from({ length }).keys());
};

export const isNil = (value: unknown): value is Nil => {
  return value === null || value === undefined;
};