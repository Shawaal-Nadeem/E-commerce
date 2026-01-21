'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPriceFilter, updatePriceFilter } from './admin-actions';
import { Button } from '@/common/button';

type PriceFilter = {
  sys: {
    id: string;
  };
  fields: {
    title: string;
    value: string;
  };
};

type PriceFilterFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  priceFilter?: PriceFilter;
  onRefresh?: () => void;
};

export function PriceFilterFormModal({
  isOpen,
  onClose,
  priceFilter,
  onRefresh,
}: PriceFilterFormModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse existing value if editing
  const parseValue = (value: string) => {
    const parts = value.split('-');
    const minValue = parts[0] || '0';
    const maxValue = parts[1] === 'max' ? '-1' : parts[1] || '0';
    return { minValue, maxValue };
  };

  const existingValues = priceFilter ? parseValue(priceFilter.fields.value) : { minValue: '0', maxValue: '0' };

  const [title, setTitle] = useState(priceFilter?.fields.title || '');
  const [minValue, setMinValue] = useState(existingValues.minValue);
  const [maxValue, setMaxValue] = useState(existingValues.maxValue);

  // Check if all required fields are filled
  const isFormValid = title.trim() !== '' && minValue.trim() !== '' && maxValue.trim() !== '';

  // Auto-generate title based on values
  useEffect(() => {
    if (!priceFilter && minValue && maxValue) {
      const min = parseInt(minValue) || 0;
      const max = parseInt(maxValue);
      
      if (max === -1) {
        setTitle(`More than ₨${min.toLocaleString()}`);
      } else if (min === 0) {
        setTitle(`Less than ₨${max.toLocaleString()}`);
      } else {
        setTitle(`₨${min.toLocaleString()} - ₨${max.toLocaleString()}`);
      }
    }
  }, [minValue, maxValue, priceFilter]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('title', title);
    formData.set('minValue', minValue);
    formData.set('maxValue', maxValue);

    try {
      const result = priceFilter
        ? await updatePriceFilter(priceFilter.sys.id, formData)
        : await createPriceFilter(formData);

      if (result.success) {
        onClose();
        
        if (onRefresh) {
          onRefresh();
        } else {
          router.refresh();
        }
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-gradient-to-br from-white to-stone-50 dark:from-stone-900 dark:to-stone-950 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-yellow-200/50 dark:border-stone-800">
        {/* Header */}
        <div className="px-6 sm:px-8 py-4 sm:py-6 border-b border-yellow-200/50 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex-shrink-0">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
            {priceFilter ? 'Edit Price Filter' : 'Add New Price Filter'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 font-medium">
            {priceFilter 
              ? 'Update price range information' 
              : 'Create a new price filter for the search page'}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 sm:px-8 py-4 sm:py-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-200 rounded-xl border border-rose-200 dark:border-rose-800">
              <strong className="font-bold">Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Min Value */}
            <div>
              <label
                htmlFor="minValue"
                className="block text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Minimum Value (PKR) *
              </label>
              <input
                type="number"
                id="minValue"
                name="minValue"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                required
                min="0"
                step="1"
                placeholder="0"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-yellow-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all shadow-sm"
              />
              <p className="text-xs text-stone-500 dark:text-stone-500 mt-1 font-medium">
                Starting price of the range (e.g., 10000 for ₨10,000)
              </p>
            </div>

            {/* Max Value */}
            <div>
              <label
                htmlFor="maxValue"
                className="block text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Maximum Value (PKR) *
              </label>
              <input
                type="number"
                id="maxValue"
                name="maxValue"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                required
                step="1"
                placeholder="50000 (or -1 for unlimited)"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-yellow-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all shadow-sm"
              />
              <p className="text-xs text-stone-500 dark:text-stone-500 mt-1 font-medium">
                Ending price (e.g., 50000 for ₨50,000) or -1 for unlimited
              </p>
            </div>

            {/* Display Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Display Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g., ₨10,000 - ₨50,000"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-yellow-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all shadow-sm"
              />
              <p className="text-xs text-stone-500 dark:text-stone-500 mt-1 font-medium">
                {priceFilter 
                  ? 'Update the display text shown to customers' 
                  : 'Auto-generated from values (you can customize)'}
              </p>
            </div>

            {/* Preview */}
            {title && (
              <div className="p-4 bg-yellow-50/50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/50 rounded-xl">
                <p className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-2">Preview:</p>
                <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 text-stone-950 font-bold text-sm">
                  {title}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="px-6 sm:px-8 py-4 sm:py-6 border-t border-yellow-200/50 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex justify-end gap-2 sm:gap-3 flex-shrink-0">
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            disabled={isSubmitting}
            size="large"
            className="border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 text-sm sm:text-base px-4 sm:px-6 font-bold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            size="large"
            className={`bg-gradient-to-r from-yellow-500 to-yellow-600 text-stone-950 font-bold text-sm sm:text-base px-4 sm:px-6 border-2 border-white/20 shadow-md transition-all ${
              isSubmitting || !isFormValid
                ? 'opacity-40 cursor-not-allowed hover:from-yellow-500 hover:to-yellow-600'
                : 'hover:from-yellow-600 hover:to-yellow-700 hover:shadow-xl'
            }`}
            onClick={(e: any) => {
              if (isSubmitting || !isFormValid) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              
              e.preventDefault();
              const form = document.querySelector('form') as HTMLFormElement;
              if (form) {
                form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
              }
            }}
          >
            {isSubmitting
              ? 'Saving...'
              : priceFilter
                ? 'Update Price Filter'
                : 'Create Price Filter'}
          </Button>
        </div>
      </div>
    </div>
  );
}
