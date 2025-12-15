import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

export class ImageUtils {
  private static readonly UPLOAD_DIR = path.join(
    process.cwd(),
    'uploads',
    'avatars',
  );

  /**
   * Ensure upload directory exists
   */
  static ensureUploadDir() {
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
    }
  }

  /**
   * Process and save avatar image
   * Compresses to 500x500px and converts to WebP format
   */
  static async processAvatar(
    fileBuffer: Buffer,
    filename: string,
  ): Promise<string> {
    this.ensureUploadDir();

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const ext = '.webp';
    const savedFilename = `avatar_${timestamp}_${Math.random().toString(36).substring(7)}${ext}`;
    const filepath = path.join(this.UPLOAD_DIR, savedFilename);

    try {
      // Process image: resize to 500x500 and convert to WebP
      await sharp(fileBuffer)
        .resize(500, 500, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 80 })
        .toFile(filepath);

      // Return relative path for storage in DB
      return `/uploads/avatars/${savedFilename}`;
    } catch (error) {
      console.error('Error processing avatar:', error);
      throw new Error('Failed to process avatar image');
    }
  }

  /**
   * Delete avatar file
   */
  static deleteAvatar(avatarUrl: string) {
    try {
      if (avatarUrl && !avatarUrl.includes('ui-avatars.com')) {
        const filepath = path.join(process.cwd(), avatarUrl);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }
    } catch (error) {
      console.error('Error deleting avatar:', error);
    }
  }

  /**
   * Generate fallback avatar URL with initials
   */
  static generateFallbackAvatar(firstName: string, lastName: string): string {
    const initials =
      `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random`;
  }
}
