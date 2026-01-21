import { Categories } from '@/categories/categories';
import { Container } from '@/common/container';
import { Hero } from '@/common/hero';
import { getMetadata } from '@/seo/seo-utils';
import { createClient } from 'contentful';
import { Temp } from './temp';

export const metadata = getMetadata({ 
  title: 'Arif Jewellers - Luxury Jewelry Store in Pakistan | Gold, Diamond & Bridal Jewelry',
  description: 'Discover exquisite jewelry collections at Arif Jewellers Pakistan. Shop luxury necklaces, bangles, rings, and earrings crafted with finest gold and diamonds. Premium bridal and wedding jewelry.',
  pathname: '/',
  keywords: [
    'jewelry store Pakistan',
    'luxury jewelry',
    'gold jewelry Pakistan',
    'diamond jewelry',
    'bridal jewelry Pakistan',
    'wedding jewelry',
    'gold necklaces',
    'diamond rings',
    'gold bangles',
    'Pakistani jewelers',
  ],
});

export default async function LandingPage() {

  const spaceId = process.env.NEXT_PUBLIC_SPACE_ID;
  const accessToken = process.env.NEXT_PUBLIC_CONTENT_DELIVERY_API;

  const client = createClient({
    space: spaceId as string,
    accessToken: accessToken as string,
  });

  let data = null;

  try {
    const ecommData = await client.getEntries({
      content_type: 'categories',
    });
    data = ecommData.items[0]; 
  } catch (err) {
    console.error('Error fetching data:', err);
  }

  return (
    <main className="bg-gradient-to-br from-stone-50 via-yellow-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 min-h-screen">
      {/* <Temp data = {data}/> */}
      <Hero />
      <Container maxWidth="xl" className="p-4 sm:p-6 lg:p-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-700 bg-clip-text text-transparent mb-4">
            Explore Our Collections
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base max-w-2xl mx-auto font-medium tracking-wide">
            Each piece tells a story of elegance and sophistication
          </p>
        </div>
        <Categories categories = {data?.fields?.category} />
      </Container>
    </main>
  );
}
