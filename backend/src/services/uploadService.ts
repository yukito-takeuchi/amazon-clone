import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Initialize GCS (only in production)
let storage: Storage | null = null;
let bucket: any = null;

console.log('🔍 GCS Init Check:');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - GCS_BUCKET_NAME:', process.env.GCS_BUCKET_NAME ? 'set' : 'not set');
console.log('  - GCS_CREDENTIALS:', process.env.GCS_CREDENTIALS ? 'set' : 'not set');

if (process.env.NODE_ENV === 'production' && process.env.GCS_BUCKET_NAME) {
  try {
    if (process.env.GCS_CREDENTIALS) {
      // Base64 encoded credentials
      const decoded = Buffer.from(process.env.GCS_CREDENTIALS, 'base64').toString('utf-8');
      const credentials = JSON.parse(decoded);
      storage = new Storage({ credentials });
      console.log('  - Storage created with base64 credentials');
    } else {
      console.log('  - No GCS credentials provided');
    }

    if (storage) {
      bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
      console.log('✅ Google Cloud Storage initialized');
      console.log('  - Bucket:', process.env.GCS_BUCKET_NAME);
    }
  } catch (error) {
    console.error('❌ GCS initialization error:', error);
  }
} else {
  console.log('⚠️  GCS not initialized - using local storage');
  if (process.env.NODE_ENV !== 'production') {
    console.log('  - Reason: Not in production mode');
  }
  if (!process.env.GCS_BUCKET_NAME) {
    console.log('  - Reason: GCS_BUCKET_NAME not set');
  }
}

export interface UploadResult {
  url: string;
  filename: string;
}

/**
 * Upload file to local storage (development) or GCS (production)
 */
export async function uploadFile(
  file: Express.Multer.File,
  folder: 'products' | 'avatars'
): Promise<UploadResult> {
  const timestamp = Date.now();
  const extension = path.extname(file.originalname);
  const filename = `${folder}/${timestamp}-${Math.random().toString(36).substring(7)}${extension}`;

  if (process.env.NODE_ENV === 'production' && bucket) {
    // Upload to Google Cloud Storage
    return uploadToGCS(file, filename);
  } else {
    // Upload to local storage
    return uploadToLocal(file, filename);
  }
}

/**
 * Upload file to local storage
 */
async function uploadToLocal(
  file: Express.Multer.File,
  filename: string
): Promise<UploadResult> {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const folder = path.dirname(filename);
  const folderPath = path.join(uploadsDir, folder);

  // Create directory if it doesn't exist
  if (!fs.existsSync(folderPath)) {
    await mkdir(folderPath, { recursive: true });
  }

  const filePath = path.join(uploadsDir, filename);
  await writeFile(filePath, file.buffer);

  // Return URL accessible from frontend
  const url = `${process.env.API_URL || 'http://localhost:3001'}/uploads/${filename}`;

  return {
    url,
    filename,
  };
}

/**
 * Upload file to Google Cloud Storage
 */
async function uploadToGCS(
  file: Express.Multer.File,
  filename: string
): Promise<UploadResult> {
  if (!bucket) {
    throw new Error('GCS bucket not initialized');
  }

  const blob = bucket.file(filename);
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', (err: Error) => {
      reject(err);
    });

    blobStream.on('finish', async () => {
      // Make file public
      await blob.makePublic();

      const url = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filename}`;

      resolve({
        url,
        filename,
      });
    });

    blobStream.end(file.buffer);
  });
}

/**
 * Delete file from local storage or GCS
 */
export async function deleteFile(filename: string): Promise<void> {
  if (process.env.NODE_ENV === 'production' && bucket) {
    // Delete from GCS
    await bucket.file(filename).delete();
  } else {
    // Delete from local storage
    const filePath = path.join(process.cwd(), 'uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
