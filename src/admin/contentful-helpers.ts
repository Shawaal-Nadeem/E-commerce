import { createClient } from 'contentful-management';

/**
 * Get authenticated Contentful Management Client
 */
export function getManagementClient() {
  const accessToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  
  if (!accessToken) {
    throw new Error(
      'CONTENTFUL_MANAGEMENT_TOKEN is not configured. ' +
      'Please add it to your .env file. ' +
      'Get it from: Contentful Dashboard > Settings > API keys > Content management tokens'
    );
  }

  return createClient({ accessToken });
}

/**
 * Get Contentful environment (defaults to 'master')
 */
export async function getEnvironment(environmentId: string = 'master') {
  const spaceId = process.env.NEXT_PUBLIC_SPACE_ID;
  
  if (!spaceId) {
    throw new Error(
      'NEXT_PUBLIC_SPACE_ID is not configured. ' +
      'Please add it to your .env file.'
    );
  }

  const client = getManagementClient();
  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(environmentId);
  
  return environment;
}

/**
 * Create a rich text document for Contentful
 */
export function createRichTextDocument(text: string) {
  return {
    nodeType: 'document',
    data: {},
    content: [
      {
        nodeType: 'paragraph',
        data: {},
        content: [
          {
            nodeType: 'text',
            value: text,
            marks: [],
            data: {},
          },
        ],
      },
    ],
  };
}

/**
 * Extract plain text from a Contentful rich text document
 */
export function extractTextFromRichText(richText: any): string {
  if (!richText) return '';
  if (typeof richText === 'string') return richText;
  
  if (richText.content && Array.isArray(richText.content)) {
    return richText.content
      .map((node: any) => {
        if (node.content && Array.isArray(node.content)) {
          return node.content
            .map((text: any) => text.value || '')
            .join('');
        }
        return '';
      })
      .join(' ')
      .trim();
  }
  
  return '';
}

/**
 * Create a link to a Contentful entry
 */
export function createEntryLink(entryId: string) {
  return {
    sys: {
      type: 'Link',
      linkType: 'Entry',
      id: entryId,
    },
  };
}

/**
 * Create a link to a Contentful asset
 */
export function createAssetLink(assetIdOrUrl: string) {
  // Extract asset ID from URL if a full URL is provided
  // URL format: https://images.ctfassets.net/SPACE_ID/ASSET_ID/...
  // or: //images.ctfassets.net/SPACE_ID/ASSET_ID/...
  let assetId = assetIdOrUrl;
  
  if (assetIdOrUrl.includes('ctfassets.net') || assetIdOrUrl.includes('images.contentful.com')) {
    // Extract asset ID from URL
    const urlParts = assetIdOrUrl.split('/');
    // Find the part after the space ID (which is after 'ctfassets.net' or 'images.contentful.com')
    const ctfIndex = urlParts.findIndex(part => part.includes('ctfassets.net') || part.includes('images.contentful.com'));
    if (ctfIndex !== -1 && urlParts.length > ctfIndex + 2) {
      assetId = urlParts[ctfIndex + 2]; // Space ID is at +1, Asset ID is at +2
    }
  }
  
  return {
    sys: {
      type: 'Link',
      linkType: 'Asset',
      id: assetId,
    },
  };
}

/**
 * Publish an entry after creating or updating
 */
export async function publishEntry(entry: any) {
  try {
    const published = await entry.publish();
    return { success: true, entry: published };
  } catch (error) {
    console.error('Failed to publish entry:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to publish' 
    };
  }
}

/**
 * Unpublish and delete an entry
 */
export async function deleteEntry(entry: any) {
  try {
    if (entry.isPublished()) {
      await entry.unpublish();
    }
    await entry.delete();
    return { success: true };
  } catch (error) {
    console.error('Failed to delete entry:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete' 
    };
  }
}

/**
 * Upload an image to Contentful and return the asset ID
 */
export async function uploadImageToContentful(
  file: Buffer,
  fileName: string,
  contentType: string,
  title: string
) {
  try {
    const environment = await getEnvironment();

    // Step 1: Create an upload
    const upload = await environment.createUpload({
      file: file,
    });

    // Step 2: Create asset with the upload
    const asset = await environment.createAsset({
      fields: {
        title: {
          'en-US': title,
        },
        file: {
          'en-US': {
            contentType,
            fileName,
            uploadFrom: {
              sys: {
                type: 'Link',
                linkType: 'Upload',
                id: upload.sys.id,
              },
            },
          },
        },
      },
    });

    // Step 3: Process the asset for all locales
    const processedAsset = await asset.processForAllLocales();
    
    // Step 4: Wait for processing to complete (poll for a few seconds)
    let attempts = 0;
    const maxAttempts = 15;
    
    while (attempts < maxAttempts) {
      const updatedAsset = await environment.getAsset(processedAsset.sys.id);
      const fileDetails = updatedAsset.fields.file?.['en-US'];
      
      if (fileDetails && fileDetails.url) {
        // Step 5: Publish the asset
        await updatedAsset.publish();
        return {
          success: true,
          assetId: updatedAsset.sys.id,
          url: fileDetails.url,
        };
      }
      
      // Wait 1 second before next attempt
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Asset processing timed out');
  } catch (error) {
    console.error('Failed to upload image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
}

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extract asset ID from a Contentful asset URL
 */
export function extractAssetIdFromUrl(url: string): string | null {
  if (!url) return null;
  
  // Handle various URL formats:
  // - https://images.ctfassets.net/SPACE_ID/ASSET_ID/...
  // - //images.ctfassets.net/SPACE_ID/ASSET_ID/...
  // - Already an asset ID
  
  if (!url.includes('ctfassets.net') && !url.includes('images.contentful.com')) {
    // Assume it's already an asset ID
    return url;
  }
  
  const urlParts = url.split('/');
  const ctfIndex = urlParts.findIndex(part => part.includes('ctfassets.net') || part.includes('images.contentful.com'));
  
  if (ctfIndex !== -1 && urlParts.length > ctfIndex + 2) {
    return urlParts[ctfIndex + 2]; // Space ID is at +1, Asset ID is at +2
  }
  
  return null;
}

/**
 * Check if a content type exists in Contentful
 */
export async function contentTypeExists(contentTypeId: string): Promise<boolean> {
  try {
    const environment = await getEnvironment();
    await environment.getContentType(contentTypeId);
    return true;
  } catch (error) {
    return false;
  }
}
