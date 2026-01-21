'use client';

import { Package, Layers, DollarSign } from 'lucide-react';

export function AdminStats({
  totalProducts,
  totalCategories,
  totalPriceFilters = 0,
}: {
  totalProducts: number;
  totalCategories: number;
  totalPriceFilters?: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
      <div className="bg-gradient-to-br from-white to-stone-50 dark:from-stone-900 dark:to-stone-950 rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-yellow-100 dark:border-stone-800 hover:shadow-2xl transition-all hover:-translate-y-1 hover:border-yellow-400">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
              Total Products
            </p>
            <p className="text-4xl sm:text-5xl font-bold mt-3 bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">{totalProducts}</p>
            <p className="text-xs text-stone-500 dark:text-stone-500 mt-2 font-medium">
              Luxury items in collection
            </p>
          </div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center shadow-xl flex-shrink-0">
            <Package className="w-9 h-9 sm:w-11 sm:h-11 text-stone-950" strokeWidth={2} />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-stone-50 dark:from-stone-900 dark:to-stone-950 rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-yellow-100 dark:border-stone-800 hover:shadow-2xl transition-all hover:-translate-y-1 hover:border-yellow-400">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
              Categories
            </p>
            <p className="text-4xl sm:text-5xl font-bold mt-3 bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">{totalCategories}</p>
            <p className="text-xs text-stone-500 dark:text-stone-500 mt-2 font-medium">
              Collections available
            </p>
          </div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center shadow-xl flex-shrink-0">
            <Layers className="w-9 h-9 sm:w-11 sm:h-11 text-stone-950" strokeWidth={2} />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-stone-50 dark:from-stone-900 dark:to-stone-950 rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-yellow-100 dark:border-stone-800 hover:shadow-2xl transition-all hover:-translate-y-1 hover:border-yellow-400">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
              Price Filters
            </p>
            <p className="text-4xl sm:text-5xl font-bold mt-3 bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">{totalPriceFilters}</p>
            <p className="text-xs text-stone-500 dark:text-stone-500 mt-2 font-medium">
              Active price ranges
            </p>
          </div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center shadow-xl flex-shrink-0">
            <DollarSign className="w-9 h-9 sm:w-11 sm:h-11 text-stone-950" strokeWidth={2} />
          </div>
        </div>
      </div>
    </div>
  );
}
