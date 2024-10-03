import { Categories } from '@/categories/categories';
import { Container } from '@/common/container';
import { Hero } from '@/common/hero';
import { getMetadata } from '@/seo/seo-utils';
import { createClient } from 'contentful';
import { Temp } from './temp';

export const metadata = getMetadata({ title: 'Home', pathname: '/' });

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
    <main>
      {/* <Temp data = {data}/> */}
      <Hero />
      <Container maxWidth="xl" className="p-4">
        <Categories categories = {data?.fields?.category} />
      </Container>
    </main>
  );
}
