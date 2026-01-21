'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { ServerActionResult } from '@/server-actions/server-action-types';
import {
  getEnvironment,
  createRichTextDocument,
  createEntryLink,
  createAssetLink,
  publishEntry,
  deleteEntry,
  uploadImageToContentful,
  generateSlug,
  contentTypeExists,
} from './contentful-helpers';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  imageUrl: z.string().min(1, 'Image URL or Asset ID is required'),
});

const productUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  imageUrl: z.string().min(1).optional(), // Optional but must be valid if provided
});

type ProductInput = z.infer<typeof productSchema>;
type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

type ContentfulProduct = ProductInput & {
  entryId: string;
};

export async function createProduct(
  formData: FormData,
): Promise<ServerActionResult<ProductInput, ContentfulProduct>> {
  try {
    const rawData = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      price: formData.get('price'),
      description: formData.get('description'),
      categoryId: formData.get('categoryId'),
      imageUrl: formData.get('imageUrl'),
    };

    const validatedData = productSchema.parse(rawData);
    const environment = await getEnvironment();

    // Create the product entry in Contentful
    // Note: 'productEntry' is the content type, 'productsData' is just a field name in categories
    const entry = await environment.createEntry('productEntry', {
      fields: {
        name: {
          'en-US': validatedData.name,
        },
        slug: {
          'en-US': validatedData.slug,
        },
        price: {
          'en-US': validatedData.price,
        },
        description: {
          'en-US': createRichTextDocument(validatedData.description),
        },
        images: {
          'en-US': [createAssetLink(validatedData.imageUrl)],
        },
      },
    });

    // Publish the entry
    const publishResult = await publishEntry(entry);
    if (!publishResult.success) {
      throw new Error(publishResult.error);
    }

    // Now add this product to the category
    const categoryEntry = await environment.getEntry(validatedData.categoryId);
    const currentProducts = categoryEntry.fields.productsData?.['en-US'] || [];
    
    categoryEntry.fields.productsData = {
      'en-US': [...currentProducts, createEntryLink(entry.sys.id)],
    };

    const updatedCategory = await categoryEntry.update();
    await publishEntry(updatedCategory);

    revalidatePath('/admin');
    revalidatePath('/');

    return {
      success: true,
      data: {
        ...validatedData,
        entryId: entry.sys.id,
      },
    };
  } catch (error) {
    console.error('Create product error:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        fieldErrors: error.format(),
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product',
    };
  }
}

export async function updateProduct(
  entryId: string,
  formData: FormData,
): Promise<ServerActionResult<ProductInput, ContentfulProduct>> {
  try {
    const imageUrlValue = formData.get('imageUrl');
    
    // Convert empty string or null to undefined for optional validation
    let processedImageUrl: string | undefined = undefined;
    if (imageUrlValue && typeof imageUrlValue === 'string' && imageUrlValue.trim() !== '') {
      processedImageUrl = imageUrlValue.trim();
    }
    
    const rawData = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      price: formData.get('price'),
      description: formData.get('description'),
      categoryId: formData.get('categoryId'),
      imageUrl: processedImageUrl,
    };

 

    const validatedData = productUpdateSchema.parse(rawData);
    const environment = await getEnvironment();

    // Get and update the product entry
    const entry = await environment.getEntry(entryId);
    
    entry.fields.name = { 'en-US': validatedData.name };
    entry.fields.slug = { 'en-US': validatedData.slug };
    entry.fields.price = { 'en-US': validatedData.price };
    entry.fields.description = {
      'en-US': createRichTextDocument(validatedData.description),
    };
    
    // Update image only if a new one is provided
    if (validatedData.imageUrl) {

      
      const assetLink = createAssetLink(validatedData.imageUrl);
      
      entry.fields.images = {
        'en-US': [assetLink],
      };
      
     
    } 

    const updatedEntry = await entry.update();
    
    const publishResult = await publishEntry(updatedEntry);
    if (!publishResult.success) {
      console.error('❌ Failed to publish:', publishResult.error);
      throw new Error(publishResult.error);
    }

    revalidatePath('/admin');
    revalidatePath('/');

   

    return {
      success: true,
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        price: validatedData.price,
        description: validatedData.description,
        categoryId: validatedData.categoryId,
        imageUrl: validatedData.imageUrl || '',
        entryId: updatedEntry.sys.id,
      },
    };
  } catch (error) {
    console.error('Update product error:', error);
    if (error instanceof z.ZodError) {
      console.error('Validation error details:', error.issues);
      return {
        success: false,
        fieldErrors: error.format(),
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product',
    };
  }
}

export async function deleteProduct(
  entryId: string,
  categoryId: string,
): Promise<ServerActionResult<never, { entryId: string }>> {
  try {
    const environment = await getEnvironment();

    // Remove product reference from category
    const categoryEntry = await environment.getEntry(categoryId);
    const currentProducts = categoryEntry.fields.productsData?.['en-US'] || [];
    
    categoryEntry.fields.productsData = {
      'en-US': currentProducts.filter(
        (product: any) => product.sys.id !== entryId
      ),
    };

    const updatedCategory = await categoryEntry.update();
    await publishEntry(updatedCategory);

    // Unpublish and delete the product entry
    const productEntry = await environment.getEntry(entryId);
    const deleteResult = await deleteEntry(productEntry);
    
    if (!deleteResult.success) {
      throw new Error(deleteResult.error);
    }

    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true, data: { entryId } };
  } catch (error) {
    console.error('Delete product error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete product',
    };
  }
}

export async function uploadImage(
  formData: FormData,
): Promise<ServerActionResult<never, { assetId: string; url: string }>> {
  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return {
        success: false,
        error: 'No file provided',
      };
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.',
      };
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Maximum size is 10MB.',
      };
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Contentful
    const result = await uploadImageToContentful(
      buffer,
      file.name,
      file.type,
      file.name.replace(/\.[^/.]+$/, '') // Remove extension for title
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to upload image',
      };
    }

    return {
      success: true,
      data: {
        assetId: result.assetId!,
        url: result.url!,
      },
    };
  } catch (error) {
    console.error('Upload image error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
}

export async function autoGenerateSlug(name: string): Promise<string> {
  return generateSlug(name);
}

// =====================================================
// CATEGORY CRUD OPERATIONS
// =====================================================

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  overlayColor: z.string().optional(),
  imageUrl: z.string().optional(),
  imageAssetId: z.string().optional(),
});

type CategoryInput = z.infer<typeof categorySchema>;

// =====================================================
// PRICE FILTER SCHEMA
// =====================================================

const priceFilterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  minValue: z.coerce.number().min(0, 'Min value must be 0 or greater'),
  maxValue: z.coerce.number().refine((val) => val === -1 || val > 0, {
    message: 'Max value must be greater than 0 or -1 for unlimited',
  }),
});

type PriceFilterInput = z.infer<typeof priceFilterSchema>;

export async function createCategory(
  formData: FormData,
): Promise<ServerActionResult<CategoryInput, { entryId: string }>> {
  try {
    const rawData = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      overlayColor: formData.get('overlayColor') || undefined,
      imageUrl: formData.get('imageUrl') || undefined,
      imageAssetId: formData.get('imageAssetId') || undefined,
    };

    const validatedData = categorySchema.parse(rawData);
    const environment = await getEnvironment();

    // Create the category entry in Contentful
    
    // SMART APPROACH: Fetch the "categories" collection, then follow links to get a real category entry
    let existingCategoryStructure: any = null;
    let contentTypeIdToUse = 'categoryEntry'; // Default based on Contentful UI
    
    try {
      const categoriesCollection = await environment.getEntries({
        content_type: 'categories',
        limit: 1,
      });
      
      
      if (categoriesCollection.items.length > 0) {
        const collection = categoriesCollection.items[0];
       
        
        // Extract the first linked category entry ID
        const categoryField = collection.fields.category?.['en-US'];
        if (categoryField && Array.isArray(categoryField) && categoryField.length > 0) {
          const firstCategoryLink = categoryField[0];
          const categoryEntryId = firstCategoryLink.sys?.id;
          
          if (categoryEntryId) {
            
            // Fetch the actual category entry by ID
            const actualCategoryEntry = await environment.getEntry(categoryEntryId);
            existingCategoryStructure = actualCategoryEntry;
            contentTypeIdToUse = existingCategoryStructure.sys.contentType.sys.id;
            
         
          } 
        } 
      } 
    } catch (e) {
      console.error('⚠️ Error fetching existing categories:', e);
    }

    // Create the category entry using the discovered structure or defaults
    let entry;
    
    // Build fields object dynamically based on what exists or use defaults
    const fieldsToCreate: any = {};
    
    if (existingCategoryStructure) {
      const existingFields = existingCategoryStructure.fields;
      
   
      
      // Check which name field exists
      if ('categoryName' in existingFields) {
        fieldsToCreate.categoryName = { 'en-US': validatedData.name };
      } else if ('name' in existingFields) {
        fieldsToCreate.name = { 'en-US': validatedData.name };
      }
      
      // Add slug
      if ('slug' in existingFields) {
        fieldsToCreate.slug = { 'en-US': validatedData.slug };
      }
      
      // Add productsData if it exists
      if ('productsData' in existingFields) {
        fieldsToCreate.productsData = { 'en-US': [] };
      }
      
      // Add overlayColor if provided and field exists
      if (validatedData.overlayColor && 'overlayColor' in existingFields) {
        fieldsToCreate.overlayColor = { 'en-US': validatedData.overlayColor };
      }
      
      // Add categoryImage if provided and field exists
      const imageIdOrUrl = validatedData.imageAssetId || validatedData.imageUrl;
      if (imageIdOrUrl && 'categoryImage' in existingFields) {
        fieldsToCreate.categoryImage = { 'en-US': createAssetLink(imageIdOrUrl) };
      }
    } else {
      // Use default structure based on Contentful UI (Category Entry content type)
      fieldsToCreate.categoryName = { 'en-US': validatedData.name };
      fieldsToCreate.slug = { 'en-US': validatedData.slug };
      fieldsToCreate.productsData = { 'en-US': [] };
      
      // Add optional fields with defaults
      if (validatedData.overlayColor) {
        fieldsToCreate.overlayColor = { 'en-US': validatedData.overlayColor };
      }
      const imageIdOrUrl = validatedData.imageAssetId || validatedData.imageUrl;
      if (imageIdOrUrl) {
        fieldsToCreate.categoryImage = { 'en-US': createAssetLink(imageIdOrUrl) };
      }
      
    }
    
    
    
    entry = await environment.createEntry(contentTypeIdToUse, {
      fields: fieldsToCreate,
    });
    
   

    // Publish the entry
    const publishResult = await publishEntry(entry);
    
    if (!publishResult.success) {
      console.error('❌ Publish failed:', publishResult.error);
      throw new Error(publishResult.error);
    }
    

    // Step 3: Add category to the parent "categories" collection
    try {
      const categoriesCollection = await environment.getEntries({
        content_type: 'categories',
        limit: 1,
      });
      
      if (categoriesCollection.items.length > 0) {
        const collection = categoriesCollection.items[0];
        const existingCategories = collection.fields.category?.['en-US'] || [];
        
        
        // Add the new category entry link
        const updatedCategories = [
          ...existingCategories,
          {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: entry.sys.id,
            },
          },
        ];
        
        // Update the collection with category
        collection.fields.category = {
          'en-US': updatedCategories,
        };
        
        const updatedCollection = await collection.update();
        
        await updatedCollection.publish();
        
      } else {
      }
    } catch (collectionError) {
      console.error('⚠️ Error updating categories collection:', collectionError);
    }

    // Step 4 (Optional): Create Filter Entry and add to Filter Options > Categories > Options
    try {
      
      // Step 4A: Create the Filter Entry (individual filter option item)
      let filterEntryContentType = 'filterOptionsEntry';
      let filterEntryExists = await contentTypeExists(filterEntryContentType);
      
      if (!filterEntryExists) {
        filterEntryContentType = 'filterEntry';
        filterEntryExists = await contentTypeExists(filterEntryContentType);
      }
      
      if (!filterEntryExists) {
        throw new Error('Filter entry content type not found');
      }
      
      
      const filterEntry = await environment.createEntry(filterEntryContentType, {
        fields: {
          title: {
            'en-US': validatedData.name,
          },
          value: {
            'en-US': validatedData.slug,
          },
        },
      });
      
      
      // Publish the filter entry
      const filterPublishResult = await publishEntry(filterEntry);
      if (!filterPublishResult.success) {
        console.error('❌ Failed to publish filter entry:', filterPublishResult.error);
        throw new Error(filterPublishResult.error);
      }
      
      
      // Step 4B: Get the Filter Options entry and find the Categories section
      
      const filterOptionsEntries = await environment.getEntries({
        content_type: 'filterOptions',
        limit: 1,
      });
      
      if (filterOptionsEntries.items.length === 0) {
        throw new Error('filterOptions entry not found');
      }
      
      const filterOptionsEntry = filterOptionsEntries.items[0];
      
      // Get the categories field (which is a reference to a filterEntry)
      const categoriesFilterRef = filterOptionsEntry.fields.categories?.['en-US'];
      
      if (!categoriesFilterRef || !categoriesFilterRef.sys || !categoriesFilterRef.sys.id) {
        throw new Error('categories field not found in filterOptions');
      }
      
      const categoriesFilterId = categoriesFilterRef.sys.id;
      
      // Get the Categories filter entry
      const categoriesFilterEntry = await environment.getEntry(categoriesFilterId);
      
      // Add the new filter entry to the options array
      const existingOptions = categoriesFilterEntry.fields.options?.['en-US'] || [];
      
      const updatedOptions = [
        ...existingOptions,
        createEntryLink(filterEntry.sys.id),
      ];
      
      categoriesFilterEntry.fields.options = {
        'en-US': updatedOptions,
      };
      
      const updatedCategoriesFilter = await categoriesFilterEntry.update();
      await publishEntry(updatedCategoriesFilter);
      
    } catch (filterError) {
      console.warn('⚠️ Optional filter creation failed:', filterError);
    }

    revalidatePath('/admin');
    revalidatePath('/');

    return {
      success: true,
      data: {
        entryId: entry.sys.id,
      },
    };
  } catch (error) {
    console.error('Create category error:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        fieldErrors: error.format(),
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create category',
    };
  }
}

export async function updateCategory(
  entryId: string,
  formData: FormData,
): Promise<ServerActionResult<CategoryInput, { entryId: string }>> {
  try {
    const rawData = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      overlayColor: formData.get('overlayColor') || undefined,
      imageUrl: formData.get('imageUrl') || undefined,
      imageAssetId: formData.get('imageAssetId') || undefined,
    };

    const validatedData = categorySchema.parse(rawData);
    const environment = await getEnvironment();

    // Get the category entry BEFORE updating to get old slug
    const entry = await environment.getEntry(entryId);
    
    
    // Store the OLD slug before updating (we'll need this to find the filter entry)
    const oldSlug = entry.fields.slug?.['en-US'];
  
    
    // Determine which field name to use based on what exists
    const hasName = 'name' in entry.fields;
    const hasCategoryName = 'categoryName' in entry.fields;
    
    if (hasName) {
      entry.fields.name = { 'en-US': validatedData.name };
    } else if (hasCategoryName) {
      entry.fields.categoryName = { 'en-US': validatedData.name };
    } else {
      console.warn('⚠️ Neither name nor categoryName found, trying name...');
      entry.fields.name = { 'en-US': validatedData.name };
    }
    
    entry.fields.slug = { 'en-US': validatedData.slug };
    
    // Update overlayColor - always set it (even if empty to clear the field)
    if (validatedData.overlayColor) {
      entry.fields.overlayColor = { 'en-US': validatedData.overlayColor };
    } else if ('overlayColor' in entry.fields) {
      // Clear the overlay color if it exists and user cleared it
      delete entry.fields.overlayColor;
    }
    
    // Update categoryImage if provided (prefer imageAssetId if available)
    const imageIdOrUrl = validatedData.imageAssetId || validatedData.imageUrl;
    if (imageIdOrUrl) {
      entry.fields.categoryImage = { 'en-US': createAssetLink(imageIdOrUrl) };
    }

    const updatedEntry = await entry.update();
    const publishResult = await publishEntry(updatedEntry);
    if (!publishResult.success) {
      throw new Error(publishResult.error);
    }

    // Update the corresponding Filter Entry (Optional)
    try {
    
      
      // Get the Filter Options entry
      const filterOptionsEntries = await environment.getEntries({
        content_type: 'filterOptions',
        limit: 1,
      });
      
      if (filterOptionsEntries.items.length === 0) {
        throw new Error('filterOptions entry not found');
      }
      
      const filterOptionsEntry = filterOptionsEntries.items[0];
      
      // Get the categories filter entry ID
      const categoriesFilterRef = filterOptionsEntry.fields.categories?.['en-US'];
      
      if (!categoriesFilterRef || !categoriesFilterRef.sys || !categoriesFilterRef.sys.id) {
        throw new Error('categories field not found');
      }
      
      const categoriesFilterId = categoriesFilterRef.sys.id;
      const categoriesFilterEntry = await environment.getEntry(categoriesFilterId);
      
      // Get all filter entries from the options array
      const filterOptionsLinks = categoriesFilterEntry.fields.options?.['en-US'] || [];
      
      // Fetch all filter entries
      const filterEntries = await Promise.all(
        filterOptionsLinks.map((link: any) => 
          environment.getEntry(link.sys.id).catch(() => null)
        )
      ).then(entries => entries.filter(e => e !== null));
      
      // Find the filter entry that matches the OLD slug
      let foundMatch = false;
      
      for (const filterEntry of filterEntries) {
        const filterValue = filterEntry.fields.value?.['en-US'];
        
        
        // Match by OLD slug (not the new one!)
        if (filterValue === oldSlug) {
    
          
          filterEntry.fields.title = { 'en-US': validatedData.name };
          filterEntry.fields.value = { 'en-US': validatedData.slug };
          
          const updatedFilterEntry = await filterEntry.update();
          await publishEntry(updatedFilterEntry);
          
          foundMatch = true;
          break;
        }
      }
      
      if (!foundMatch) {
      }
    } catch (filterError) {
      console.warn('⚠️ Optional filter update failed:', filterError);
      
    }

    revalidatePath('/admin');
    revalidatePath('/');

    return {
      success: true,
      data: {
        entryId: updatedEntry.sys.id,
      },
    };
  } catch (error) {
    console.error('Update category error:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        fieldErrors: error.format(),
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update category',
    };
  }
}

export async function deleteCategory(
  entryId: string,
): Promise<ServerActionResult<never, { entryId: string }>> {
  try {
    const environment = await getEnvironment();

    // Get the category to check if it has products
    const categoryEntry = await environment.getEntry(entryId);
    const products = categoryEntry.fields.productsData?.['en-US'] || [];
    
    // If there are products, delete them first
    if (products.length > 0) {
      
      for (const productLink of products) {
        try {
          const productId = productLink.sys.id;
          
          const productEntry = await environment.getEntry(productId);
          await deleteEntry(productEntry);
          
        } catch (productDeleteError) {
          console.error(`⚠️ Error deleting product:`, productDeleteError);
          // Continue with other products even if one fails
        }
      }
      
    }

    // Get the category slug to find and delete the corresponding filter option
    const categorySlug = categoryEntry.fields.slug?.['en-US'];
    
    // Remove category from collection
    try {
      
      const categoriesCollection = await environment.getEntries({
        content_type: 'categories',
        limit: 1,
      });
      
      if (categoriesCollection.items.length > 0) {
        const collection = categoriesCollection.items[0];
        const existingCategories = collection.fields.category?.['en-US'] || [];
        
        // Remove category from collection's category field
        const updatedCategories = existingCategories.filter(
          (link: any) => link.sys.id !== entryId
        );
        
        collection.fields.category = {
          'en-US': updatedCategories,
        };
        
        // Update and publish the collection
        const updatedCollection = await collection.update();
        await updatedCollection.publish();
        
      }
    } catch (collectionError) {
      console.error('⚠️ Error removing category from collection:', collectionError);
    }
    
    // Delete the corresponding Filter Entry (Optional)
    try {
      
      // Get the Filter Options entry
      const filterOptionsEntries = await environment.getEntries({
        content_type: 'filterOptions',
        limit: 1,
      });
      
      if (filterOptionsEntries.items.length === 0) {
        throw new Error('filterOptions entry not found');
      }
      
      const filterOptionsEntry = filterOptionsEntries.items[0];
      
      // Get the categories filter entry ID
      const categoriesFilterRef = filterOptionsEntry.fields.categories?.['en-US'];
      
      if (!categoriesFilterRef || !categoriesFilterRef.sys || !categoriesFilterRef.sys.id) {
        throw new Error('categories field not found');
      }
      
      const categoriesFilterId = categoriesFilterRef.sys.id;
      const categoriesFilterEntry = await environment.getEntry(categoriesFilterId);
      
      // Get all filter entries from the options array
      const filterOptionsLinks = categoriesFilterEntry.fields.options?.['en-US'] || [];
      
      // Fetch all filter entries
      const filterEntries = await Promise.all(
        filterOptionsLinks.map((link: any) => 
          environment.getEntry(link.sys.id).catch(() => null)
        )
      ).then(entries => entries.filter(e => e !== null));
      
      // Find and delete the filter entry that matches this category's slug
      let filterEntryToDelete: any = null;
      
      for (const filterEntry of filterEntries) {
        const filterValue = filterEntry.fields.value?.['en-US'];
        
        if (filterValue === categorySlug) {
          filterEntryToDelete = filterEntry;
          break;
        }
      }
      
      if (filterEntryToDelete) {
        // Delete the filter entry
        await deleteEntry(filterEntryToDelete);
        
        // Remove from the categories filter's options array
        const updatedOptions = filterOptionsLinks.filter(
          (link: any) => link.sys.id !== filterEntryToDelete.sys.id
        );
        
        categoriesFilterEntry.fields.options = {
          'en-US': updatedOptions,
        };
        
        const updatedCategoriesFilter = await categoriesFilterEntry.update();
        await publishEntry(updatedCategoriesFilter);
        
      } 
    } catch (filterError) {
      console.warn('⚠️ Optional filter deletion failed:', filterError);
    }

    // Unpublish and delete the category entry
    const deleteResult = await deleteEntry(categoryEntry);
    
    if (!deleteResult.success) {
      throw new Error(deleteResult.error);
    }

    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true, data: { entryId } };
  } catch (error) {
    console.error('Delete category error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete category',
    };
  }
}

// =====================================================
// PRICE FILTER CRUD OPERATIONS
// =====================================================

export async function createPriceFilter(
  formData: FormData,
): Promise<ServerActionResult<PriceFilterInput, { entryId: string }>> {
  try {
    const rawData = {
      title: formData.get('title'),
      minValue: formData.get('minValue'),
      maxValue: formData.get('maxValue'),
    };

    const validatedData = priceFilterSchema.parse(rawData);
    const environment = await getEnvironment();


    // Determine the filter entry content type
    let filterEntryContentType = 'filterOptionsEntry';
    let filterEntryExists = await contentTypeExists(filterEntryContentType);
    
    if (!filterEntryExists) {
      filterEntryContentType = 'filterEntry';
      filterEntryExists = await contentTypeExists(filterEntryContentType);
    }
    
    if (!filterEntryExists) {
      return {
        success: false,
        error: 'Filter entry content type not found in Contentful',
      };
    }


    // Create value string (e.g., "10-50" or "100-max")
    const value = validatedData.maxValue === -1 
      ? `${validatedData.minValue}-max` 
      : `${validatedData.minValue}-${validatedData.maxValue}`;

    // Create the filter entry
    const filterEntry = await environment.createEntry(filterEntryContentType, {
      fields: {
        title: {
          'en-US': validatedData.title,
        },
        value: {
          'en-US': value,
        },
      },
    });


    // Publish the filter entry
    const filterPublishResult = await publishEntry(filterEntry);
    if (!filterPublishResult.success) {
      console.error('❌ Failed to publish filter entry:', filterPublishResult.error);
      throw new Error(filterPublishResult.error);
    }


    // Add to Filter Options > Price > Options
    try {
      
      const filterOptionsEntries = await environment.getEntries({
        content_type: 'filterOptions',
        limit: 1,
      });
      
      if (filterOptionsEntries.items.length === 0) {
        throw new Error('filterOptions entry not found');
      }
      
      const filterOptionsEntry = filterOptionsEntries.items[0];
      
      // Get the price field (try different field name variations)
      const fields = filterOptionsEntry.fields as any;
      const priceFilterRef = fields.priceRanges?.['en-US'] 
        || fields.price_ranges?.['en-US']
        || fields.price?.['en-US']
        || fields.priceranges?.['en-US'];
      
      if (!priceFilterRef || !priceFilterRef.sys || !priceFilterRef.sys.id) {
        throw new Error('price field not found in filterOptions');
      }
      
      const priceFilterId = priceFilterRef.sys.id;
      
      // Get the Price filter entry
      const priceFilterEntry = await environment.getEntry(priceFilterId);
      
      // Add the new filter entry to the options array
      const existingOptions = priceFilterEntry.fields.options?.['en-US'] || [];
      
      const updatedOptions = [
        ...existingOptions,
        createEntryLink(filterEntry.sys.id),
      ];
      
      priceFilterEntry.fields.options = {
        'en-US': updatedOptions,
      };
      
      const updatedPriceFilter = await priceFilterEntry.update();
      await publishEntry(updatedPriceFilter);
      
    
    } catch (filterError) {
      console.error('❌ Failed to add to filter options:', filterError);
      // Delete the created filter entry since we couldn't add it to the list
      await deleteEntry(filterEntry);
      throw new Error('Failed to add price filter to options list');
    }

    revalidatePath('/admin');
    revalidatePath('/search');

    return {
      success: true,
      data: {
        entryId: filterEntry.sys.id,
      },
    };
  } catch (error) {
    console.error('Create price filter error:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        fieldErrors: error.format(),
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create price filter',
    };
  }
}

export async function updatePriceFilter(
  entryId: string,
  formData: FormData,
): Promise<ServerActionResult<PriceFilterInput, { entryId: string }>> {
  try {
    const rawData = {
      title: formData.get('title'),
      minValue: formData.get('minValue'),
      maxValue: formData.get('maxValue'),
    };

    const validatedData = priceFilterSchema.parse(rawData);
    const environment = await getEnvironment();


    // Get the filter entry
    const entry = await environment.getEntry(entryId);

    // Create value string
    const value = validatedData.maxValue === -1 
      ? `${validatedData.minValue}-max` 
      : `${validatedData.minValue}-${validatedData.maxValue}`;

    // Update fields
    entry.fields.title = { 'en-US': validatedData.title };
    entry.fields.value = { 'en-US': value };

    const updatedEntry = await entry.update();
    const publishResult = await publishEntry(updatedEntry);
    
    if (!publishResult.success) {
      throw new Error(publishResult.error);
    }


    revalidatePath('/admin');
    revalidatePath('/search');

    return {
      success: true,
      data: {
        entryId: updatedEntry.sys.id,
      },
    };
  } catch (error) {
    console.error('Update price filter error:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        fieldErrors: error.format(),
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update price filter',
    };
  }
}

export async function deletePriceFilter(
  entryId: string,
): Promise<ServerActionResult<never, { entryId: string }>> {
  try {
    const environment = await getEnvironment();


    // Remove from Filter Options > Price > Options
    try {
      const filterOptionsEntries = await environment.getEntries({
        content_type: 'filterOptions',
        limit: 1,
      });
      
      if (filterOptionsEntries.items.length > 0) {
        const filterOptionsEntry = filterOptionsEntries.items[0];
        
        // Get the price field (try different field name variations)
        const fields = filterOptionsEntry.fields as any;
        const priceFilterRef = fields.priceRanges?.['en-US'] 
          || fields.price_ranges?.['en-US']
          || fields.price?.['en-US']
          || fields.priceranges?.['en-US'];
        
        if (priceFilterRef && priceFilterRef.sys && priceFilterRef.sys.id) {
          const priceFilterId = priceFilterRef.sys.id;
          const priceFilterEntry = await environment.getEntry(priceFilterId);
          
          const existingOptions = priceFilterEntry.fields.options?.['en-US'] || [];
          const updatedOptions = existingOptions.filter(
            (link: any) => link.sys.id !== entryId
          );
          
          priceFilterEntry.fields.options = {
            'en-US': updatedOptions,
          };
          
          const updatedPriceFilter = await priceFilterEntry.update();
          await publishEntry(updatedPriceFilter);
          
        }
      }
    } catch (filterError) {
      console.warn('⚠️ Error removing from filter options:', filterError);
    }

    // Delete the filter entry
    const filterEntry = await environment.getEntry(entryId);
    const deleteResult = await deleteEntry(filterEntry);
    
    if (!deleteResult.success) {
      throw new Error(deleteResult.error);
    }


    revalidatePath('/admin');
    revalidatePath('/search');

    return { success: true, data: { entryId } };
  } catch (error) {
    console.error('Delete price filter error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete price filter',
    };
  }
}
