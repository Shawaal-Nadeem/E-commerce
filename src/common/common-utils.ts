import type { Nil } from './common-types';

export const APP_URL = 'https://e-commerce-sigma-lime.vercel.app';
export const APP_TITLE = 'Mart-Shawaal';
export const APP_DESCRIPTION = `${APP_TITLE} is a fullstack e-commerce web app built with Next.js`;
export const APP_REPOSITORY_URL = 'https://github.com/Shawaal-Nadeem';

export const createMockArray = (length: number) => {
  // eslint-disable-next-line unicorn/prefer-spread
  return Array.from(Array.from({ length }).keys());
};

export const isNil = (value: unknown): value is Nil => {
  return value === null || value === undefined;
};