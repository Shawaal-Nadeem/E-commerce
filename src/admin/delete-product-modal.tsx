'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteProduct } from './admin-actions';
import { Button } from '@/common/button';

type Product = {
  sys: {
    id: string;
  };
  fields: {
    name: string;
  };
  categoryId: string;
};

type DeleteProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onRefresh?: () => void;
};

export function DeleteProductModal({
  isOpen,
  onClose,
  product,
  onRefresh,
}: DeleteProductModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteProduct(product.sys.id, product.categoryId);

      if (result.success) {
      
        onClose();
        
        // Trigger refresh with loading state
        if (onRefresh) {
          onRefresh();
        } else {
          router.refresh();
        }
      } else {
        setError(result.error || 'Failed to delete product');
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
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-rose-900 dark:text-rose-100">
                Delete Product
              </h2>
              <p className="text-sm text-rose-700 dark:text-rose-300 mt-0.5 font-medium">
                This action is permanent
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {error && (
            <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-200 rounded-xl border border-rose-200 dark:border-rose-800">
              <strong className="font-bold">Error:</strong> {error}
            </div>
          )}

          <div className="space-y-4">
            <p className="text-base text-stone-700 dark:text-stone-300">
              Are you sure you want to delete this product?
            </p>
            
            <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-xl border border-yellow-200 dark:border-stone-700">
              <p className="text-sm font-bold mb-1 text-stone-500 dark:text-stone-400 uppercase tracking-wider">Product Name:</p>
              <p className="text-base font-bold text-stone-900 dark:text-stone-100">{product.fields.name}</p>
            </div>

            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/30 rounded-xl p-4">
              <p className="text-sm text-rose-900 dark:text-rose-200 font-bold">
                <strong className="font-bold">⚠️ Warning:</strong> This will permanently remove the product. This action cannot be undone.
              </p>
            </div>
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
            color="error"
            onClick={handleDelete}
            disabled={isDeleting}
            size="large"
            className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold shadow-md"
          >
            {isDeleting ? 'Deleting...' : 'Delete Product'}
          </Button>
        </div>
      </div>
    </div>
  );
}
