'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createCategory, updateCategory, uploadImage } from './admin-actions';
import { Button } from '@/common/button';
import { Upload, X } from 'lucide-react';

type Category = {
  sys: {
    id: string;
  };
  fields: {
    name?: string;
    categoryName?: string;
    slug: string;
    overlayColor?: string;
    categoryImage?: {
      sys?: {
        id: string;
      };
      fields: {
        file: {
          url: string;
        };
      };
    };
    productsData?: any[];
  };
};

type CategoryFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;
  onRefresh?: () => void;
};

export function CategoryFormModal({
  isOpen,
  onClose,
  category,
  onRefresh,
}: CategoryFormModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState(category?.fields.categoryName || category?.fields.name || '');
  const [autoSlug, setAutoSlug] = useState(category?.fields.slug || '');
  const [overlayColor, setOverlayColor] = useState(category?.fields.overlayColor || '');
  const [imageUrl, setImageUrl] = useState<string>(
    category?.fields.categoryImage?.fields?.file?.url 
      ? `https:${category.fields.categoryImage.fields.file.url}`
      : ''
  );
  const [imageAssetId, setImageAssetId] = useState<string>(
    category?.fields.categoryImage?.sys?.id || ''
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Check if all required fields are filled
  const isFormValid = categoryName.trim() !== '' && autoSlug.trim() !== '' && imageUrl.trim() !== '';

  // Auto-generate slug from category name
  useEffect(() => {
    if (categoryName) {
      const slug = categoryName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setAutoSlug(slug);
    }
  }, [categoryName]);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadImage(formData);

      if (result.success && result.data) {
        setImageUrl(result.data.url);
        setImageAssetId(result.data.assetId);
      } else {
        setError(result.error || 'Failed to upload image');
      }
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('slug', autoSlug);
    
    // Only set overlayColor if it has a value, otherwise don't include it
    if (overlayColor && overlayColor.trim() !== '') {
      formData.set('overlayColor', overlayColor);
    }
    
    // Pass asset ID if we have it from a fresh upload, otherwise pass the URL (for existing images)
    if (imageAssetId) {
      formData.set('imageAssetId', imageAssetId);
    } else if (imageUrl) {
      formData.set('imageUrl', imageUrl);
    }

    try {
      const result = category
        ? await updateCategory(category.sys.id, formData)
        : await createCategory(formData);

      if (result.success) {
        onClose();
        
        // Trigger refresh with loading state
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
            {category ? 'Edit Category' : 'Add New Category'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 font-medium">
            {category 
              ? 'Update category information' 
              : 'Create a new category for your products'}
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
            {/* Category Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Category Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
                placeholder="e.g., Women's Jewelry"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-yellow-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all shadow-sm"
              />
            </div>

            {/* Auto-generated Slug */}
            <div>
              <label
                htmlFor="slug"
                className="block text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5"
              >
                URL Slug (Auto-generated)
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={autoSlug}
                readOnly
                placeholder="auto-generated-from-name"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-yellow-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-900 text-stone-500 dark:text-stone-500 cursor-not-allowed"
              />
              <p className="text-xs text-stone-500 dark:text-stone-500 mt-1 font-medium">
                {category 
                  ? 'Updates automatically when you change the category name' 
                  : 'Automatically generated from category name'}
              </p>
            </div>

            {/* Overlay Color */}
            <div>
              <label
                htmlFor="overlayColor"
                className="block text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Overlay Color
              </label>
              <div className="flex items-center gap-2 sm:gap-3">
                {overlayColor && overlayColor.trim() !== '' && (
                  <input
                    type="color"
                    id="overlayColor"
                    name="overlayColor"
                    value={overlayColor}
                    onChange={(e) => setOverlayColor(e.target.value)}
                    className="h-10 sm:h-12 w-16 sm:w-20 border border-yellow-200 dark:border-stone-800 rounded-lg cursor-pointer shadow-sm"
                  />
                )}
                <input
                  type="text"
                  value={overlayColor}
                  onChange={(e) => setOverlayColor(e.target.value)}
                  placeholder="e.g., #40BF80 (Optional)"
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-yellow-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all shadow-sm"
                />
                {overlayColor && overlayColor.trim() !== '' && (
                  <button
                    type="button"
                    onClick={() => setOverlayColor('')}
                    className="px-3 py-2.5 text-sm font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-500 mt-1 font-medium">
                Color used for category card overlay (leave empty for no overlay)
              </p>
            </div>

            {/* Category Image Upload */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Category Image *
              </label>
              
              {imageUrl ? (
                <div className="relative group">
                  <img
                    src={imageUrl}
                    alt="Category preview"
                    className="w-full h-40 sm:h-48 object-cover rounded-xl border border-yellow-200 dark:border-stone-800"
                  />
                  <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setImageAssetId('');
                      }}
                      className="p-2.5 sm:p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all shadow-sm ${
                    dragActive
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/10'
                      : 'border-yellow-200 dark:border-stone-700 hover:border-yellow-400 bg-stone-50 dark:bg-stone-950/30'
                  }`}
                >
                  <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-yellow-600" />
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 mb-2 font-bold text-center px-4">
                    {uploadingImage ? 'Uploading...' : 'Drag and drop an image here, or click to select'}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageUpload(e.target.files[0]);
                      }
                    }}
                    disabled={uploadingImage}
                    className="hidden"
                    id="categoryImageInput"
                  />
                  <label
                    htmlFor="categoryImageInput"
                    className="inline-block px-4 py-2 text-sm bg-gradient-to-r from-yellow-500 to-yellow-600 text-stone-950 font-bold rounded-lg cursor-pointer transition-all hover:from-yellow-600 hover:to-yellow-700 shadow-md border border-white/20"
                  >
                    Select Image
                  </label>
                </div>
              )}
              <p className="text-xs text-stone-500 dark:text-stone-500 mt-1 font-medium">
                Upload a category banner image (Required)
              </p>
            </div>
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
              // Respect disabled state
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
              : category
                ? 'Update Category'
                : 'Create Category'}
          </Button>
        </div>
      </div>
    </div>
  );
}
