import { CartDrawer } from '@/cart/cart-drawer';
import { TooltipProvider } from '@/common/tooltip';
import { Layout, LayoutFooter, LayoutHeader } from '@/layout/layout';
import '@/styles/global.css';
import type { Viewport } from 'next';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';
import { twJoin } from 'tailwind-merge';
import ContextApp from '@/contextAPI/contextAPI';
import { getMetadata, getOrganizationSchema } from '@/seo/seo-utils';

const inter = Inter({
  variable: '--font-inter',
  display: 'swap',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#EAB308', // Gold theme color
};

// SEO Metadata
export const metadata = getMetadata({
  title: 'Arif Jewellers - Luxury Jewelry Store in Pakistan',
  description: 'Discover timeless elegance and exquisite craftsmanship in fine jewelry. Shop luxury necklaces, bangles, rings, and earrings at Arif Jewellers - Pakistan\'s premier jewelry destination.',
  pathname: '/',
  keywords: [
    'luxury jewelry Pakistan',
    'gold jewelry store',
    'diamond jewelry Pakistan',
    'bridal jewelry',
    'wedding jewelry',
    'Pakistani jewelers',
  ],
});

type RootLayoutProps = React.PropsWithChildren;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={twJoin(
        inter.variable,
        'font-sans',
        // fluid font-size:
        // 14px - 16px for 640px - 1024px viewport
        'text-[clamp(0.875rem,0.667rem+0.52vw,1rem)]',
      )}
      // Required for `next-themes`.
      // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
      suppressHydrationWarning
    >
      <head>
        {/* JSON-LD Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationSchema()),
          }}
        />
      </head>
      <body className="bg-background text-foreground">
        <ContextApp>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <TooltipProvider>
            <Layout>
              <LayoutHeader>
                {/* Cart hidden as per client request */}
                {/* <div className="hidden md:block">
                  <CartDrawer />
                </div> */}
              </LayoutHeader>
              <div className="mt-app-header">{children}</div>
              <LayoutFooter>
                {/* Cart hidden as per client request */}
                {/* <CartDrawer /> */}
              </LayoutFooter>
            </Layout>
          </TooltipProvider>
        </ThemeProvider>
        </ContextApp>
      </body>
    </html>
  );
}
