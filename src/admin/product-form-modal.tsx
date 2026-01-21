'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, updateProduct, uploadImage } from './admin-actions';
import { Button } from '@/common/button';
import { Upload, X } from 'lucide-react';

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
};

type ProductFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  product?: Product;
  onRefresh?: () => void;
};

export function ProductFormModal({
  isOpen,
  onClose,
  categories,
  product,
  onRefresh,
}: ProductFormModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productName, setProductName] = useState(product?.fields.name || '');
  const [autoSlug, setAutoSlug] = useState(product?.fields.slug || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.fields.images?.[0]?.fields.file.url 
      ? `https:${product.fields.images[0].fields.file.url}` 
      : null
  );
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [price, setPrice] = useState(product?.fields.price?.toString() || '');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(product?.categoryId || '');

  // Check if all required fields are filled for new products
  const isFormValid = product 
    ? true // Always valid when editing (all required fields should already exist)
    : productName.trim() !== '' && 
      autoSlug.trim() !== '' && 
      price.trim() !== '' && 
      categoryId.trim() !== '' && 
      description.trim() !== '' && 
      (imagePreview !== null || uploadedAssetId !== null);

  // Auto-generate slug from product name
  useEffect(() => {
    if (productName) {
      const slug = productName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setAutoSlug(slug);
    }
  }, [productName]);

  // Initialize description for existing products
  useEffect(() => {
    if (product) {
      setDescription(getDescriptionText(product.fields.description));
    }
  }, [product]);

  if (!isOpen) return null;

  const getDescriptionText = (description: any) => {
    if (!description) return '';
    if (typeof description === 'string') return description;
    if (description.content && Array.isArray(description.content)) {
      return description.content
        .map((node: any) => {
          if (node.content && Array.isArray(node.content)) {
            return node.content
              .map((text: any) => text.value || '')
              .join('');
          }
          return '';
        })
        .join(' ');
    }
    return '';
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size too large. Maximum size is 10MB.');
      return;
    }

    setImageFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Contentful immediately
    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      
      const uploadResult = await uploadImage(uploadFormData);
      
      if (uploadResult.success && uploadResult.data) {
        setUploadedAssetId(uploadResult.data.assetId);
        setError(null);
      } else {
        setError(uploadResult.error || 'Failed to upload image');
        setImageFile(null);
        setImagePreview(null);
      }
    } catch (err) {
      setError('Failed to upload image');
      setImageFile(null);
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadedAssetId(null);
    
    // Clear the existing product image preview if editing
    if (product?.fields.images?.[0]) {
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    // Add auto-generated slug
    formData.set('slug', autoSlug);
    
    // Handle image for create vs update
    if (uploadedAssetId) {
      // New image was uploaded
   
      formData.set('imageUrl', uploadedAssetId);
    } else if (!product) {
      // Creating new product - image is required
      setError('Please upload a product image');
      setIsSubmitting(false);
      return;
    } else {
      // Updating product without new image - don't send imageUrl
      // The backend will keep the existing image
      formData.delete('imageUrl');
    }
    
    
   

    try {
      const result = product
        ? await updateProduct(product.sys.id, formData)
        : await createProduct(formData);

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
      <div className="bg-gradient-to-br from-white to-stone-50 dark:from-stone-900 dark:to-stone-950 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-yellow-200/50 dark:border-stone-800">
        {/* Header */}
        <div className="px-6 sm:px-8 py-4 sm:py-6 border-b border-yellow-200/50 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex-shrink-0">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 font-medium">
            {product 
              ? 'Update luxury product information' 
              : 'Add a new item to your collection'}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 sm:px-8 py-4 sm:py-6 flex-1">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-200 rounded-xl border border-rose-200 dark:border-rose-800">
              <strong className="font-bold">Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2"
                >
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                  placeholder="e.g., Diamond Necklace"
                  className="w-full px-4 py-3 border border-yellow-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all shadow-sm"
                />
              </div>

              {/* Auto-generated Slug (read-only) */}
              <div className="md:col-span-2">
                <label
                  htmlFor="slug"
                  className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2"
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
                  className="w-full px-4 py-3 border border-yellow-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-900 text-stone-500 dark:text-stone-500 cursor-not-allowed"
                />
                <p className="text-xs text-stone-500 dark:text-stone-500 mt-1.5 font-medium">
                  {product 
                    ? 'Updates automatically when you change the product name' 
                    : 'Automatically generated from product name'}
                </p>
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2"
                >
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-600 font-bold">
                    PKR
                  </span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    step="1"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    placeholder="5000"
                    className="w-full pl-14 pr-4 py-3 border border-yellow-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2"
                >
                  Category *
                </label>
                {product ? (
                  <>
                    {/* Hidden input to submit categoryId */}
                    <input type="hidden" name="categoryId" value={product.categoryId} />
                    {/* Display as read-only text field */}
                    <input
                      type="text"
                      value={product.categoryName}
                      readOnly
                      className="w-full px-4 py-3 border border-yellow-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-900 text-stone-500 dark:text-stone-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-stone-500 dark:text-stone-500 mt-1.5 font-medium">
                      Category cannot be changed after creation
                    </p>
                  </>
                ) : (
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-yellow-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all shadow-sm"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">
                  Product Image *
                </label>
                
                {imagePreview ? (
                  <div className="relative group">
                    <div className="relative w-full h-64 rounded-xl overflow-hidden border border-yellow-200 dark:border-stone-800">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-full h-full object-contain bg-white dark:bg-stone-950"
                      />
                      <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-colors shadow-lg"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-stone-950/60 rounded-xl">
                        <div className="text-white font-bold flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Uploading...
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-yellow-300 dark:border-stone-700 rounded-xl cursor-pointer bg-stone-50 dark:bg-stone-950/30 hover:bg-yellow-50 dark:hover:bg-yellow-950/10 transition-colors shadow-sm">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                      <Upload className="w-12 h-12 mb-4 text-yellow-600" />
                      <p className="mb-2 text-sm text-stone-700 dark:text-stone-300 font-bold">
                        <span>Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-500 font-medium">
                        PNG, JPG, WebP or GIF (Max 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                )}
                
                {isUploading && !imagePreview && (
                  <div className="mt-2 text-center">
                    <p className="text-sm text-yellow-600 dark:text-yellow-500 font-bold animate-pulse">
                      Uploading image...
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Enter detailed product description..."
                  className="w-full px-4 py-3 border border-yellow-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all resize-none shadow-sm"
                />
                <p className="text-xs text-stone-500 dark:text-stone-500 mt-1.5 font-medium">
                  Provide a comprehensive description
                </p>
              </div>
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
            disabled={isSubmitting || isUploading || !isFormValid}
            size="large"
            className={`bg-gradient-to-r from-yellow-500 to-yellow-600 text-stone-950 font-bold text-sm sm:text-base px-4 sm:px-6 border-2 border-white/20 shadow-md transition-all ${
              isSubmitting || isUploading || !isFormValid
                ? 'opacity-40 cursor-not-allowed hover:from-yellow-500 hover:to-yellow-600'
                : 'hover:from-yellow-600 hover:to-yellow-700 hover:shadow-xl'
            }`}
            onClick={(e: any) => {
              // Respect disabled state
              if (isSubmitting || isUploading || !isFormValid) {
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
            {isUploading
              ? 'Uploading...'
              : isSubmitting
                ? 'Saving...'
                : product
                  ? 'Update Product'
                  : 'Create Product'}
          </Button>
        </div>
      </div>
    </div>
  );
}
