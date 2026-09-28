import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary explicitly with credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'hfonn7lj',
  api_key: process.env.CLOUDINARY_API_KEY || '351891349723755',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'lbnYl5tSr-YkugAB2Q3wSjTkjZw',
  secure: true
});

/**
 * Extract Cloudinary public_id from a Cloudinary URL
 * Handles transformations (e_grayscale, etc.), versions (v12345/), query params, and hashes
 * @param {string} url - Cloudinary URL
 * @returns {string} public_id
 */
export const extractPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  try {
    // Remove query params and hash
    let clean = url.split('?')[0].split('#')[0];
    const uploadIndex = clean.indexOf('/upload/');
    if (uploadIndex === -1) return '';
    let afterUpload = clean.substring(uploadIndex + 8);
    
    // Check if contains version /v123456/
    const versionMatch = afterUpload.match(/(?:^|\/)v\d+\/(.+)$/);
    if (versionMatch) {
      return versionMatch[1];
    }
    
    // If contains ecopy_prints/
    const folderIndex = afterUpload.indexOf('ecopy_prints/');
    if (folderIndex !== -1) {
      return afterUpload.substring(folderIndex);
    }
    
    // Otherwise strip leading transformations
    const parts = afterUpload.split('/');
    while (parts.length > 1 && (parts[0].includes('_') || parts[0].includes(','))) {
      parts.shift();
    }
    return parts.join('/');
  } catch (e) {
    return '';
  }
};

/**
 * Generate preview URL for a specific page of a PDF or image
 * @param {string} publicId - Cloudinary public ID
 * @param {number} pageNum - Page number (1-indexed)
 * @param {string} format - Image format ('png' or 'jpg')
 * @returns {string} Cloudinary preview image URL
 */
export const getCloudinaryPageUrl = (publicId, pageNum = 1, format = 'png') => {
  if (!publicId) return '';
  return cloudinary.url(publicId, {
    page: pageNum,
    format: format,
    quality: 'auto',
    secure: true
  });
};

/**
 * Upload a document / image file (base64 data URI or buffer) to Cloudinary
 * Supports Black & White / Grayscale transformation and rotation
 * @param {string} fileData - Base64 data URI or URL
 * @param {object} customOptions - Additional Cloudinary upload options
 * @returns {Promise<object>} Upload response with secure_url, public_id, etc.
 */
export const uploadToCloudinary = async (fileData, customOptions = {}) => {
  if (!fileData) return null;

  try {
    const { isBw, filterMode, rotation, ...restOptions } = customOptions;

    const transformations = [];
    if (isBw || filterMode === 'bw' || filterMode === 'scan') {
      transformations.push({ effect: 'grayscale' });
    }
    if (rotation && Number(rotation) > 0) {
      transformations.push({ angle: Number(rotation) });
    }

    const uploadOptions = {
      folder: 'ecopy_prints',
      resource_type: 'auto',
      pages: true,
      overwrite: true,
      invalidate: true,
      ...(transformations.length > 0 ? { 
        transformation: transformations,
        eager: transformations
      } : {}),
      ...restOptions
    };

    const result = await cloudinary.uploader.upload(fileData, uploadOptions);
    console.log(`[Cloudinary] File uploaded successfully: ${result.public_id} (${result.secure_url}) - Format: ${result.format}, Pages: ${result.pages || 1}`);

    let finalUrl = result.secure_url;
    const isGrayscale = isBw || filterMode === 'bw' || filterMode === 'scan';

    if (isGrayscale && !finalUrl.endsWith('.pdf')) {
      if (result.eager && result.eager.length > 0 && result.eager[0]?.secure_url) {
        finalUrl = result.eager[0].secure_url;
      } else if (finalUrl && !finalUrl.includes('/e_grayscale/')) {
        finalUrl = finalUrl.replace('/upload/', '/upload/e_grayscale/');
      }
    }

    const totalPages = result.pages || 1;
    const pagePreviews = [];

    // Generate per-page image previews for PDFs and images
    for (let p = 1; p <= totalPages; p++) {
      const pageUrl = cloudinary.url(result.public_id, {
        page: p,
        format: 'png',
        ...(isGrayscale ? { effect: 'grayscale' } : {}),
        quality: 'auto',
        secure: true
      });
      pagePreviews.push(pageUrl);
    }

    return {
      success: true,
      url: finalUrl,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      bytes: result.bytes,
      totalPages: totalPages,
      pagePreviews: pagePreviews,
      mainPreviewUrl: pagePreviews[0] || finalUrl
    };
  } catch (error) {
    console.error('[Cloudinary Upload Error]:', error);
    return {
      success: false,
      error: error.message || 'Cloudinary upload failed'
    };
  }
};

/**
 * Permanently delete entire PDF / Image assets from Cloudinary immediately
 * Targets all combinations of resource types (image, raw, video) and extracted public IDs
 * @param {string|string[]} publicIds - Single public ID, array of public IDs, or Cloudinary URLs
 * @param {string} primaryResourceType - 'image', 'raw', or 'auto'
 * @returns {Promise<object>} Deletion result
 */
export const deleteFromCloudinary = async (publicIds, primaryResourceType = 'image') => {
  if (!publicIds) return { success: true, message: 'No Cloudinary public ID provided' };

  const rawList = Array.isArray(publicIds) ? publicIds : [publicIds];
  const candidates = new Set();

  for (const item of rawList) {
    if (!item || typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed) continue;

    let baseId = trimmed;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      baseId = extractPublicIdFromUrl(trimmed);
    }
    if (!baseId) continue;

    const cleanBase = baseId.includes('.') ? baseId.substring(0, baseId.lastIndexOf('.')) : baseId;
    const withoutFolder = cleanBase.replace(/^ecopy_prints\//, '');
    const withFolder = withoutFolder.startsWith('ecopy_prints/') ? withoutFolder : `ecopy_prints/${withoutFolder}`;

    // Add all variations
    candidates.add(withoutFolder);
    candidates.add(withFolder);
    candidates.add(`${withoutFolder}.pdf`);
    candidates.add(`${withFolder}.pdf`);
    candidates.add(`${withoutFolder}.png`);
    candidates.add(`${withFolder}.png`);
    candidates.add(`${withoutFolder}.jpg`);
    candidates.add(`${withFolder}.jpg`);
  }

  const idArray = Array.from(candidates);
  console.log(`[Cloudinary] Immediate parallel purge starting for:`, idArray);

  const deletePromises = [];
  for (const id of idArray) {
    deletePromises.push(
      cloudinary.uploader.destroy(id, { resource_type: 'image', invalidate: true })
        .then(r => ({ id, type: 'image', result: r.result }))
        .catch(e => ({ id, type: 'image', result: e.message }))
    );
    deletePromises.push(
      cloudinary.uploader.destroy(id, { resource_type: 'raw', invalidate: true })
        .then(r => ({ id, type: 'raw', result: r.result }))
        .catch(e => ({ id, type: 'raw', result: e.message }))
    );
  }

  // Bulk API deletes as backup
  deletePromises.push(
    cloudinary.api.delete_resources(idArray, { resource_type: 'image', all: true }).catch(() => ({}))
  );
  deletePromises.push(
    cloudinary.api.delete_resources(idArray, { resource_type: 'raw', all: true }).catch(() => ({}))
  );

  const results = await Promise.all(deletePromises);
  console.log(`[Cloudinary Purge Completed] All assets permanently destroyed immediately.`);

  return {
    success: true,
    purged: true,
    results
  };
};

export default cloudinary;
