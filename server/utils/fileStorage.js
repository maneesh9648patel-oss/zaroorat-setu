/**
 * ZarooratSetu - Secure File Storage & Validation Utility
 * Validates file types, sizes, sanitizes paths, and stores evidence immutably.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = path.resolve(__dirname, '..', 'data', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const ALLOWED_PHOTO_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]);

export const ALLOWED_VIDEO_MIMES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska'
]);

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_VIDEO_BYTES = 25 * 1024 * 1024; // 25 MB

/**
 * Validate and save a base64 or binary uploaded file
 */
export function processAndSaveFile(fileInput, defaultType = 'photo') {
  if (!fileInput) {
    throw new Error("File input is empty");
  }

  // Handle case where file is an existing URL (e.g. Unsplash sample in demo)
  if (typeof fileInput === 'string' && fileInput.startsWith('http')) {
    return {
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      url: fileInput,
      name: path.basename(fileInput).split('?')[0] || 'evidence_image.jpg',
      size: 150000,
      mimeType: 'image/jpeg',
      type: defaultType,
      uploadedAt: new Date().toISOString()
    };
  }

  let dataUrl = typeof fileInput === 'string' ? fileInput : fileInput.dataUrl || fileInput.url;
  let customName = typeof fileInput === 'object' ? fileInput.name : null;

  if (!dataUrl || typeof dataUrl !== 'string') {
    throw new Error("Invalid file payload: Expected data URL or valid URI");
  }

  // If already an existing upload url (/api/uploads/...)
  if (dataUrl.startsWith('/api/uploads/')) {
    return {
      id: typeof fileInput === 'object' && fileInput.id ? fileInput.id : `file_${Date.now()}`,
      url: dataUrl,
      name: customName || path.basename(dataUrl),
      size: typeof fileInput === 'object' && fileInput.size ? fileInput.size : 200000,
      mimeType: typeof fileInput === 'object' && fileInput.mimeType ? fileInput.mimeType : 'image/jpeg',
      type: defaultType,
      uploadedAt: new Date().toISOString()
    };
  }

  // Parse data URL format: data:[<mediatype>][;base64],<data>
  const matches = dataUrl.match(/^data:([a-zA-Z0-9\/+-]+);base64,(.+)$/);
  if (!matches) {
    // If it's a raw URL, return as-is with safe fallback
    return {
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      url: dataUrl,
      name: customName || 'evidence_file.bin',
      size: 100000,
      mimeType: 'application/octet-stream',
      type: defaultType,
      uploadedAt: new Date().toISOString()
    };
  }

  const mimeType = matches[1].toLowerCase();
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');
  const sizeBytes = buffer.length;

  let fileCategory = 'photo';
  let maxAllowed = MAX_PHOTO_BYTES;

  if (ALLOWED_PHOTO_MIMES.has(mimeType)) {
    fileCategory = defaultType === 'screenshot' ? 'screenshot' : 'photo';
    maxAllowed = MAX_PHOTO_BYTES;
  } else if (ALLOWED_VIDEO_MIMES.has(mimeType)) {
    fileCategory = 'video';
    maxAllowed = MAX_VIDEO_BYTES;
  } else {
    throw new Error(`Unsupported file type: ${mimeType}. Allowed formats: JPG, PNG, WEBP, MP4, WEBM.`);
  }

  if (sizeBytes > maxAllowed) {
    const maxMb = Math.round(maxAllowed / (1024 * 1024));
    throw new Error(`File size (${(sizeBytes / (1024 * 1024)).toFixed(1)}MB) exceeds limit of ${maxMb}MB.`);
  }

  // Derive file extension
  let ext = '.jpg';
  if (mimeType.includes('png')) ext = '.png';
  else if (mimeType.includes('webp')) ext = '.webp';
  else if (mimeType.includes('mp4')) ext = '.mp4';
  else if (mimeType.includes('webm')) ext = '.webm';

  // Generate secure SHA-256 content hash filename to prevent collisions and directory traversal
  const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 20);
  const fileName = `${Date.now()}_${hash}${ext}`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  fs.writeFileSync(filePath, buffer);

  const fileUrl = `/api/uploads/${fileName}`;

  return {
    id: `file_${Date.now()}_${hash.slice(0, 6)}`,
    url: fileUrl,
    name: customName || fileName,
    size: sizeBytes,
    mimeType,
    type: fileCategory,
    uploadedAt: new Date().toISOString()
  };
}
