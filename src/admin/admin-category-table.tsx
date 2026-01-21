'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Layers, Sparkles } from 'lucide-react';
import { Button } from '@/common/button';
import { CategoryFormModal } from './category-form-modal';
import { DeleteCategoryModal } from './delete-category-modal';

type Category = {
  sys: {
    id: string;
  };
  fields: {
    name?: string;
    categoryName?: string;
    slug: string;
    overlayColor?: string;
    categoryImage?: any;
    productsData?: any[];
  };
  id?: string;
  name?: string;
  productCount?: number;
};

type AdminCategoryTableProps = {
  categories: Category[];
  onRefresh?: () => void;
};

export function AdminCategoryTable({ categories, onRefresh }: AdminCategoryTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    
    const query = searchQuery.toLowerCase();
    return categories.filter(category => {
      const name = category?.fields?.name || category?.name || '';
      const slug = category?.fields?.slug || category?.slug || '';
      return name.toLowerCase().includes(query) || slug.toLowerCase().includes(query);
    });
  }, [categories, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-600 w-5 h-5" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-yellow-200 dark:border-yellow-900/50 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all shadow-sm"
          />
        </div>
        
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto relative group overflow-hidden bg-stone-900 dark:bg-stone-950 text-yellow-500 font-bold px-8 py-4 rounded-xl border-2 border-yellow-500/50 hover:border-yellow-400 transition-all duration-300 shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] hover:-translate-y-0.5"
          size="large"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex items-center relative z-10">
            <div className="bg-yellow-500/20 p-1.5 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-300">
              <Plus className="w-5 h-5" />
            </div>
            <span className="tracking-wide">Add Category</span>
            <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0" />
          </div>
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-yellow-200/50 dark:border-yellow-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 dark:bg-stone-950 border-b border-yellow-200/50 dark:border-yellow-900/30">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                  Category Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-100 dark:divide-yellow-900/20">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Layers className="w-12 h-12 mx-auto mb-4 text-stone-300 dark:text-stone-700" />
                    <p className="text-stone-500 dark:text-stone-500">
                      {searchQuery ? 'No categories found matching your search' : 'No categories yet'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => {
                  // Safely extract category data
                  const categoryId = category?.sys?.id || category?.id || 'unknown';
                  const categoryName = category?.fields?.categoryName || category?.fields?.name || category?.name || 'Unknown';
                  const categorySlug = category?.fields?.slug || category?.slug || 'unknown';
                  const productCount = category?.productCount || category?.fields?.productsData?.length || 0;

                  return (
                    <tr 
                      key={categoryId}
                      className="hover:bg-yellow-50/30 dark:hover:bg-yellow-950/10 transition-colors border-b border-yellow-100/50 dark:border-yellow-900/20 last:border-b-0"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-sm">
                            <Layers className="w-5 h-5 text-stone-950" />
                          </div>
                          <span className="font-semibold text-stone-900 dark:text-stone-100">
                            {categoryName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-stone-500 dark:text-stone-500">
                          {categorySlug}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                          {productCount} {productCount === 1 ? 'Product' : 'Products'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingCategory(category)}
                            className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/40 text-yellow-700 dark:text-yellow-500 transition-colors border border-yellow-200/50"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingCategory(category)}
                            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-500 transition-colors border border-rose-200/50"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CategoryFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onRefresh={onRefresh}
      />
      
      {editingCategory && (
        <CategoryFormModal
          isOpen={true}
          onClose={() => setEditingCategory(null)}
          category={editingCategory}
          onRefresh={onRefresh}
        />
      )}
      
      {deletingCategory && (
        <DeleteCategoryModal
          isOpen={true}
          onClose={() => setDeletingCategory(null)}
          category={deletingCategory}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}
