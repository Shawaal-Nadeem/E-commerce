'use client';

import { useState, useTransition } from 'react';
import { Package, Layers, DollarSign, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AdminProductTable } from './admin-product-table';
import { AdminCategoryTable } from './admin-category-table';
import { AdminPriceFilterTable } from './admin-price-filter-table';
import { ProductTableSkeleton } from './product-table-skeleton';
import { CategoryTableSkeleton } from './category-table-skeleton';
import { PriceFilterTableSkeleton } from './price-filter-table-skeleton';

type Product = any;
type Category = any;
type PriceFilter = any;

type AdminTabsProps = {
  products: Product[];
  categories: Category[];
  priceFilters: PriceFilter[];
};

export function AdminTabs({ products, categories, priceFilters }: AdminTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'priceFilters'>('products');
  const [isPending, startTransition] = useTransition();
  
  // Expose refresh function to child components via context or props
  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border-2 border-yellow-100 dark:border-stone-800 p-2">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-semibold transition-all ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-stone-950 shadow-lg'
                : 'text-stone-600 dark:text-stone-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/20'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="hidden sm:inline">Products</span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              activeTab === 'products'
                ? 'bg-stone-950/10 text-stone-950'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
            }`}>
              {products.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-semibold transition-all ${
              activeTab === 'categories'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-stone-950 shadow-lg'
                : 'text-stone-600 dark:text-stone-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/20'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="hidden sm:inline">Categories</span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              activeTab === 'categories'
                ? 'bg-stone-950/10 text-stone-950'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
            }`}>
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('priceFilters')}
            className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-semibold transition-all ${
              activeTab === 'priceFilters'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-stone-950 shadow-lg'
                : 'text-stone-600 dark:text-stone-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/20'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="hidden sm:inline">Price Filters</span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              activeTab === 'priceFilters'
                ? 'bg-stone-950/10 text-stone-950'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
            }`}>
              {priceFilters.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {isPending ? (
          // Show skeleton loader while refreshing
          activeTab === 'products' ? (
            <ProductTableSkeleton />
          ) : activeTab === 'categories' ? (
            <CategoryTableSkeleton />
          ) : (
            <PriceFilterTableSkeleton />
          )
        ) : (
          // Show actual content
          activeTab === 'products' ? (
            <AdminProductTable products={products} categories={categories} onRefresh={handleRefresh} />
          ) : activeTab === 'categories' ? (
            <AdminCategoryTable categories={categories} onRefresh={handleRefresh} />
          ) : (
            <AdminPriceFilterTable priceFilters={priceFilters} onRefresh={handleRefresh} />
          )
        )}
      </div>
    </div>
  );
}
