import { createClient } from 'contentful';
import { redirect } from 'next/navigation';
import { AdminTabs } from '@/admin/admin-tabs';
import { AdminProductTable } from '@/admin/admin-product-table';
import { AdminCategoryTable } from '@/admin/admin-category-table';
import { AdminStats } from '@/admin/admin-stats';
import { Container } from '@/common/container';
import { isAdminAuthenticated } from '@/auth/auth-actions';
import { AdminLogoutButton } from '@/auth/admin-logout-button';
import Image from 'next/image';

async function getNestedRichData(client: any, section: any) {
  if (section && section.fields?.productsData) {
    const productsData = await Promise.all(
      section.fields.productsData.map(async (item: any) => {
        const entry = await client.getEntry(item.sys.id);
        return entry;
      })
    );
    return productsData;
  }
  return [];
}

async function getAllProducts() {
  const spaceId = process.env.NEXT_PUBLIC_SPACE_ID;
  const accessToken = process.env.NEXT_PUBLIC_CONTENT_DELIVERY_API;

  const client = createClient({
    space: spaceId as string,
    accessToken: accessToken as string,
  });

  try {
    // Try to fetch categories data - try both content type names
    let categoriesWrapper;
    
    try {
      categoriesWrapper = await client.getEntries({
        content_type: 'categories',
      });
    } catch (e) {
      categoriesWrapper = await client.getEntries({
        content_type: 'category',
      });
    }


    const allCategories: any[] = [];
    const allProducts: any[] = [];

    // Check if the data is wrapped in a 'category' field
    for (const item of categoriesWrapper.items) {
      const itemFields = item.fields as any;
      
      // Check if categories are in a nested field
      const categoryArray = itemFields.category || [item];
      
      for (const category of categoryArray) {
        const categoryFields = category.fields || category;
        const categorySys = category.sys || item.sys;
        
        // Store category info in Contentful format with all fields
        const categoryInfo = {
          sys: {
            id: categorySys.id,
          },
          fields: {
            name: categoryFields.categoryName || categoryFields.name || categoryFields.title || 'Unknown',
            categoryName: categoryFields.categoryName || categoryFields.name || categoryFields.title || 'Unknown',
            slug: categoryFields.slug || categoryFields.value || 'unknown',
            overlayColor: categoryFields.overlayColor || undefined,
            categoryImage: categoryFields.categoryImage || undefined,
            productsData: categoryFields.productsData || [],
          },
          // Store original ID and name for easy reference in products
          id: categorySys.id,
          name: categoryFields.categoryName || categoryFields.name || categoryFields.title || 'Unknown',
        };
        
        allCategories.push(categoryInfo);

        // Fetch products for this category if they exist
        if (categoryFields.productsData) {
          const productsData = await getNestedRichData(client, category);
          
          
          // Store products with category reference
          for (const product of productsData) {
            const productFields = product.fields as any;
            
            // Ensure price is properly extracted and converted to number
            const rawPrice = productFields.price;
            const numericPrice = typeof rawPrice === 'number' ? rawPrice : parseFloat(rawPrice) || 0;
            
            const productInfo = {
              sys: product.sys,
              fields: {
                name: productFields.name,
                slug: productFields.slug,
                price: numericPrice,
                description: productFields.description,
                images: productFields.images,
              },
              categoryId: categoryInfo.id,
              categoryName: categoryInfo.name,
              categorySlug: categoryInfo.fields.slug,
            };
            
         
            allProducts.push(productInfo);
            
           
          }
        }
      }
    }

   
   

    // Add product count to categories
    const categoriesWithCount = allCategories.map(cat => ({
      ...cat,
      productCount: allProducts.filter(p => p.categoryId === cat.sys.id).length,
    }));

    // Fetch price filters from filterOptions
    let priceFilters: any[] = [];
    try {
      const filterOptionsEntries = await client.getEntries({
        content_type: 'filterOptions',
        limit: 1,
      });

      if (filterOptionsEntries.items.length > 0) {
        const filterOptionsEntry = filterOptionsEntries.items[0];
        
        // Try different field name variations for price ranges
        const priceFilterRef = (filterOptionsEntry.fields as any).priceRanges 
          || (filterOptionsEntry.fields as any).price_ranges
          || (filterOptionsEntry.fields as any).price
          || (filterOptionsEntry.fields as any).priceranges;

        if (priceFilterRef && priceFilterRef.sys && priceFilterRef.sys.id) {
          const priceFilterEntry = await client.getEntry(priceFilterRef.sys.id);
          const priceOptions = (priceFilterEntry.fields as any).options || [];

          // Fetch each price filter entry
          priceFilters = await Promise.all(
            priceOptions.map(async (option: any) => {
              try {
                const filterEntry = await client.getEntry(option.sys.id);
                return {
                  sys: filterEntry.sys,
                  fields: {
                    title: (filterEntry.fields as any).title || '',
                    value: (filterEntry.fields as any).value || '',
                  },
                };
              } catch (err) {
                console.error('Error fetching price filter entry:', err);
                return null;
              }
            })
          );

          // Filter out null entries
          priceFilters = priceFilters.filter(f => f !== null);
        }
      }
    } catch (err) {
      console.warn('⚠️ Error fetching price filters:', err);
    }

    return { products: allProducts, categories: categoriesWithCount, priceFilters };
  } catch (err) {
    console.error('❌ Error fetching data:', err);
    return { products: [], categories: [], priceFilters: [] };
  }
}

export default async function AdminPage() {
  // Check authentication
  const isAuthenticated = await isAdminAuthenticated();
  
  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  const { products, categories, priceFilters } = await getAllProducts();

  // Debug: Log products to see structure

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-yellow-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      {/* Main Container with proper padding */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Logout Button - Top Right */}
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
          <AdminLogoutButton />
        </div>

        {/* Header Section - Centered */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative w-40 h-40 sm:w-56 sm:h-56 mb-4 group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative w-full h-full flex items-center justify-center">
                <Image 
                  src="/images/logo.png" 
                  alt="Arif Jewellers Logo"
                  width={250}
                  height={250}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-700 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-2 sm:mt-3 font-medium">
              Manage your luxury jewelry collection
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mt-8 sm:mt-10">
            <AdminStats
              totalProducts={products.length}
              totalCategories={categories.length}
              totalPriceFilters={priceFilters.length}
            />
          </div>
        </div>

        {/* Tabs with Products, Categories, and Price Filters */}
        <div className="space-y-6">
          <AdminTabs products={products} categories={categories} priceFilters={priceFilters} />
        </div>
      </div>
    </div>
  );
}
