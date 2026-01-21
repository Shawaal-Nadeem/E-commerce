import { APP_DESCRIPTION, APP_TITLE, APP_URL, BUSINESS_NAME } from '@/common/common-utils';
import type { Metadata } from 'next';

export function getMetadata({
  title,
  description,
  pathname,
  images,
  keywords,
}: {
  title?: string;
  description?: string;
  pathname?: string;
  images?: Array<{ url: string; alt: string }>;
  keywords?: string[];
}): Metadata {
  const metaTitle = title ? `${title} | ${APP_TITLE}` : `${APP_TITLE} - Luxury Jewelry Store in Pakistan`;
  const metaDescription = description || APP_DESCRIPTION;
  const defaultKeywords = [
    'Arif Jewellers',
    'jewelry store Pakistan',
    'luxury jewelry',
    'gold jewelry',
    'diamond jewelry',
    'necklaces',
    'bangles',
    'rings',
    'earrings',
    'Pakistani jewelry',
    'fine jewelry',
    'gold bangles Pakistan',
    'diamond rings Pakistan',
    'wedding jewelry',
    'bridal jewelry',
  ];
  const metaKeywords = keywords ? [...keywords, ...defaultKeywords] : defaultKeywords;

  const canonicalUrl = pathname ? `${APP_URL}${pathname}` : APP_URL;
  const defaultImage = `${APP_URL}/images/logo.png`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    authors: [{ name: BUSINESS_NAME }],
    creator: BUSINESS_NAME,
    publisher: BUSINESS_NAME,
    metadataBase: new URL(APP_URL),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      title: metaTitle,
      description: metaDescription,
      siteName: APP_TITLE,
      locale: 'en_US',
      images: images || [{ url: defaultImage, alt: `${BUSINESS_NAME} Logo` }],
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: images || [defaultImage],
      creator: '@arifjewellers',
      site: '@arifjewellers',
    },
    alternates: {
      canonical: canonicalUrl,
    },
    verification: {
      google: 'your-google-verification-code', // Add your Google Search Console verification code
    },
  };
}

// JSON-LD Structured Data for Organization
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    name: BUSINESS_NAME,
    url: APP_URL,
    logo: `${APP_URL}/images/logo.png`,
    description: APP_DESCRIPTION,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PK',
      addressLocality: 'Pakistan',
    },
    sameAs: [
      // Add your social media links here
      // 'https://www.facebook.com/arifjewellers',
      // 'https://www.instagram.com/arifjewellers',
      // 'https://twitter.com/arifjewellers',
    ],
  };
}

// JSON-LD Structured Data for Product
export function getProductSchema(product: {
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  url: string;
  category: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    url: product.url,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: BUSINESS_NAME,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: 'https://schema.org/InStock',
      url: product.url,
      seller: {
        '@type': 'Organization',
        name: BUSINESS_NAME,
      },
    },
  };
}

// JSON-LD Structured Data for Breadcrumbs
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
