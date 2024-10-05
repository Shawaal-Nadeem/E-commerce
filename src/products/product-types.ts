import type { stringDatatype } from '@/common/common-types';

export type ProductImage = {
  fields: {
    file: {
      url: string;
    };
  };
};

export type ProductFields = {
  slug: string;
  name: string;
  price: number;
  images: ProductImage[];
};

export type Product = {
  id: stringDatatype;
  category: {
    title: string;
    value: string;
  };
  description: string;
  fields: ProductFields; // Include fields as an object that contains slug, name, price, and images
};
