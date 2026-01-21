'use client';

import { useState, useMemo } from 'react';
import { Paper } from '@/common/paper';
import { Button } from '@/common/button';
import { ProductFormModal } from './product-form-modal';
import { DeleteProductModal } from './delete-product-modal';
import { Price } from '@/common/price';
import { Search, Filter, X, Plus, Edit2, Trash2, Sparkles } from 'lucide-react';

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  sys: {
    id: string;
  };
  fields: {
    name: string;
    slug: string;
    price: number;
    description: any;
    images?: Array<{
      fields: {
        file: {
          url: string;
        };
      };
    }>;
  };
  categoryId: string;
  categoryName: string;
  categorySlug: string;
};

type AdminProductTableProps = {
  products: Product[];
  categories: Category[];
  onRefresh?: () => void;
};

export function AdminProductTable({
  products,
  categories,
  onRefresh,
}: AdminProductTableProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

 

  const getImageUrl = (product: Product) => {
    if (product.fields.images && product.fields.images.length > 0) {
      const url = product.fields.images[0].fields.file.url;
      return url.startsWith('http') ? url : `https:${url}`;
    }
    return '/images/placeholder.jpg';
  };

  const getPrice = (product: Product): number => {
    const price = product.fields?.price || 0;
    return Number(price) || 0;
  };

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      const matchesSearch = 
        product.fields.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.fields.slug?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = 
        selectedCategory === 'all' || product.categoryId === selectedCategory;

      // Price range filter (in thousands for PKR)
      const price = getPrice(product) / 1000; // Convert to thousands
      let matchesPrice = true;
      
      if (priceRange === '0-25') matchesPrice = price >= 0 && price <= 25;
      else if (priceRange === '25-50') matchesPrice = price > 25 && price <= 50;
      else if (priceRange === '50-100') matchesPrice = price > 50 && price <= 100;
      else if (priceRange === '100+') matchesPrice = price > 100;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchQuery, selectedCategory, priceRange]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange('all');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || priceRange !== 'all';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">Jewelry Collection</h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-1 sm:mt-2 font-medium">
            {filteredProducts.length} of {products.length} luxury items
          </p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)} 
          size="large" 
          className="w-full sm:w-auto relative group overflow-hidden bg-stone-900 dark:bg-stone-950 text-yellow-500 font-bold px-8 py-4 rounded-xl border-2 border-yellow-500/50 hover:border-yellow-400 transition-all duration-300 shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] hover:-translate-y-0.5"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex items-center relative z-10">
            <div className="bg-yellow-500/20 p-1.5 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-300">
              <Plus className="w-5 h-5" />
            </div>
            <span className="tracking-wide">Add New Product</span>
            <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0" />
          </div>
        </Button>
      </div>

      {/* Search and Filters */}
      <Paper className="p-4 sm:p-6 shadow-sm bg-stone-50 dark:bg-stone-900 border border-yellow-200/50 dark:border-yellow-900/30">
        <div className="space-y-4 sm:space-y-5">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-600 w-5 h-5" />
              <input
                type="text"
                placeholder="Search luxury products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 border border-yellow-200 dark:border-yellow-900/50 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all text-sm sm:text-base"
              />
            </div>
            <Button
              variant="outlined"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full sm:w-auto whitespace-nowrap border border-yellow-300 dark:border-yellow-800 text-yellow-700 dark:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/30"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-stone-950 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                  !
                </span>
              )}
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pt-5 border-t border-yellow-200/50 dark:border-yellow-900/30">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-bold text-stone-600 dark:text-stone-400 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-yellow-200 dark:border-yellow-900/50 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all text-sm sm:text-base"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-bold text-stone-600 dark:text-stone-400 mb-2">Price Range</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-4 py-3 border border-yellow-200 dark:border-yellow-900/50 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all text-sm sm:text-base"
                >
                  <option value="all">All Prices</option>
                  <option value="0-25">₨0 - ₨25,000</option>
                  <option value="25-50">₨25,000 - ₨50,000</option>
                  <option value="50-100">₨50,000 - ₨100,000</option>
                  <option value="100+">₨100,000+</option>
                </select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button
                    variant="outlined"
                    onClick={clearFilters}
                    className="w-full border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Paper>

      {/* Products Table */}
      <Paper className="overflow-hidden shadow-sm bg-white dark:bg-stone-900 border border-yellow-200/50 dark:border-yellow-900/30">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="border-b border-yellow-200/50 dark:border-yellow-900/30 bg-stone-50 dark:bg-stone-950">
                <th className="px-4 sm:px-6 py-4 sm:py-5 text-left text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-4 sm:px-6 py-4 sm:py-5 text-left text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 sm:px-6 py-4 sm:py-5 text-left text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 sm:px-6 py-4 sm:py-5 text-left text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 sm:px-6 py-4 sm:py-5 text-right text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-100 dark:divide-yellow-900/20">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 sm:px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-stone-400">
                      <Search className="w-16 h-16 sm:w-20 sm:h-20 mb-4 opacity-50" />
                      <p className="text-lg sm:text-xl font-medium">No products found</p>
                      <p className="text-sm sm:text-base mt-2">
                        {hasActiveFilters
                          ? 'Try adjusting your filters'
                          : 'Click "Add New Product" to create one'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.sys.id} className="hover:bg-yellow-50/30 dark:hover:bg-yellow-950/10 transition-all border-b border-yellow-100/50 dark:border-yellow-900/20 last:border-b-0">
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <img
                        src={getImageUrl(product)}
                        alt={product.fields.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shadow-sm border border-yellow-200 dark:border-yellow-900/50"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <div className="flex flex-col max-w-xs">
                        <span className="font-semibold text-sm sm:text-base truncate text-stone-900 dark:text-stone-100">
                          {product.fields.name}
                        </span>
                        <span className="text-xs sm:text-sm text-stone-500 dark:text-stone-500 mt-1 truncate">
                          {product.fields.slug}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                      <span className="font-bold text-base sm:text-lg text-yellow-600 dark:text-yellow-500">
                        <Price value={getPrice(product)} />
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 whitespace-nowrap border border-stone-200 dark:border-stone-700">
                        {product.categoryName}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/40 text-yellow-700 dark:text-yellow-500 transition-colors border border-yellow-200/50"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(product)}
                          className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-500 transition-colors border border-rose-200/50"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Paper>

      {/* Modals */}
      <ProductFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        onRefresh={onRefresh}
      />

      {editingProduct && (
        <ProductFormModal
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          categories={categories}
          product={editingProduct}
          onRefresh={onRefresh}
        />
      )}

      {deletingProduct && (
        <DeleteProductModal
          isOpen={true}
          onClose={() => setDeletingProduct(null)}
          product={deletingProduct}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}
