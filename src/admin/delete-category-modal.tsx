'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCategory } from './admin-actions';
import { Button } from '@/common/button';
import { AlertTriangle } from 'lucide-react';

type Category = {
  sys: {
    id: string;
  };
  fields: {
    name: string;
  };
  productCount?: number;
};

type DeleteCategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
  onRefresh?: () => void;
};

export function DeleteCategoryModal({
  isOpen,
  onClose,
  category,
  onRefresh,
}: DeleteCategoryModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasProducts = category.productCount && category.productCount > 0;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteCategory(category.sys.id);

      if (result.success) {
        onClose();
        
        // Trigger refresh with loading state
        if (onRefresh) {
          onRefresh();
        } else {
          router.refresh();
        }
      } else {
        setError(result.error || 'Failed to delete category');
      }
    } catch (err) {
      console.error('❌ Delete error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-gradient-to-br from-white to-rose-50 dark:from-stone-900 dark:to-stone-950 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-rose-200 dark:border-rose-900/30">
        {/* Header */}
        <div className="px-6 py-5 border-b border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-rose-900 dark:text-rose-100">
                Delete Category
              </h3>
              <p className="text-sm text-rose-700 dark:text-rose-300">
                Warning: Permanent Action
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {error && (
            <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-200 rounded-xl border border-rose-200 dark:border-rose-800">
              <strong className="font-bold">Error:</strong> {error}
            </div>
          )}

          <div className="space-y-4">
            <p className="text-stone-700 dark:text-stone-300 font-medium">
              Are you sure you want to delete the category{' '}
              <strong className="text-rose-700 dark:text-rose-300 font-bold">
                "{category?.fields?.name || category?.name || 'this category'}"
              </strong>
              ?
            </p>

            {hasProducts ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-900/50 rounded-xl">
                <p className="text-yellow-800 dark:text-yellow-300 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Cascade Delete Warning
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-2 leading-relaxed">
                  This category contains <strong>{category.productCount} {category.productCount === 1 ? 'product' : 'products'}</strong>. 
                  Deleting this category will <strong className="text-rose-600 dark:text-rose-400">permanently delete all products</strong> inside it.
                </p>
              </div>
            ) : (
              <p className="text-sm text-stone-500 dark:text-stone-500 italic">
                This category is empty. No products will be affected.
              </p>
            )}
            
            
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-rose-200 dark:border-rose-900/30 bg-stone-50 dark:bg-stone-950 flex justify-end gap-3">
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            disabled={isDeleting}
            size="large"
            className="border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 text-sm sm:text-base px-4 sm:px-6 font-bold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            size="large"
            className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold shadow-lg shadow-rose-200 dark:shadow-rose-950/40"
          >
            {isDeleting ? 'Deleting Everything...' : 'Delete Everything'}
          </Button>
        </div>
      </div>
    </div>
  );
}
