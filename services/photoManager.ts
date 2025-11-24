import { LessonWord } from '../types';
import { APP_CONFIG } from './config';
import { identifyWordFromImageWithClaude } from './claude';
import { identifyWordFromImage } from './gemini';

/**
 * Download a single image from URL
 */
const downloadImage = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  } catch (error) {
    console.error(`Failed to download image ${filename}:`, error);
    throw error;
  }
};

/**
 * Export all photos from the library
 * Downloads each photo with the word as filename
 */
export const exportAllPhotos = async (
  library: LessonWord[],
  onProgress?: (current: number, total: number) => void
): Promise<void> => {
  if (library.length === 0) {
    throw new Error('No photos to export');
  }

  for (let i = 0; i < library.length; i++) {
    const word = library[i];
    if (onProgress) {
      onProgress(i + 1, library.length);
    }

    try {
      // Extract file extension from URL or use jpg as default
      const urlParts = word.imageUrl.split('.');
      const extension = urlParts[urlParts.length - 1].split('?')[0] || 'jpg';
      const filename = `${word.word}.${extension}`;

      await downloadImage(word.imageUrl, filename);

      // Small delay between downloads to avoid overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to export photo for word "${word.word}":`, error);
      // Continue with next image
    }
  }
};

/**
 * Export library as JSON with metadata
 */
export const exportLibraryAsJSON = (library: LessonWord[]): void => {
  const jsonData = JSON.stringify(library, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `lingua-library-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Import local photos and automatically associate them with words
 */
export const importLocalPhotos = async (
  files: FileList,
  onProgress?: (current: number, total: number, word?: string) => void
): Promise<Array<{ word: string; imageUrl: string; file: File }>> => {
  const results: Array<{ word: string; imageUrl: string; file: File }> = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      console.warn(`Skipping non-image file: ${file.name}`);
      continue;
    }

    try {
      if (onProgress) {
        onProgress(i + 1, files.length);
      }

      // Read file as base64
      const base64String = await fileToBase64(file);

      // Identify word using AI
      const identifiedWord = APP_CONFIG.USE_CLAUDE
        ? await identifyWordFromImageWithClaude(base64String)
        : await identifyWordFromImage(base64String);

      if (identifiedWord && identifiedWord.trim().length > 0) {
        results.push({
          word: identifiedWord.toLowerCase().trim(),
          imageUrl: base64String,
          file: file
        });

        if (onProgress) {
          onProgress(i + 1, files.length, identifiedWord);
        }
      } else {
        console.warn(`Could not identify word in file: ${file.name}`);
      }
    } catch (error) {
      console.error(`Failed to process file ${file.name}:`, error);
    }
  }

  return results;
};

/**
 * Convert File to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Create a photo database folder structure as JSON
 * This can be used to maintain a local photo database
 */
export const createPhotoDatabase = (library: LessonWord[]): string => {
  const database = {
    version: '1.0',
    created: new Date().toISOString(),
    totalWords: library.length,
    words: library.map(word => ({
      word: word.word,
      translation: word.translation,
      imageFilename: `${word.word}.jpg`,
      category: word.category,
      tags: word.tags,
      difficulty: word.difficulty,
      stats: {
        reviewCount: word.reviewCount,
        correctCount: word.correctCount,
        incorrectCount: word.incorrectCount,
        lastReviewed: word.lastReviewed
      }
    }))
  };

  return JSON.stringify(database, null, 2);
};

/**
 * Export photo database as JSON file
 */
export const exportPhotoDatabase = (library: LessonWord[]): void => {
  const databaseJSON = createPhotoDatabase(library);
  const blob = new Blob([databaseJSON], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `lingua-photo-database-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Save image to local storage (as base64)
 * Useful for offline mode
 */
export const saveImageToLocalStorage = async (
  word: string,
  imageUrl: string
): Promise<void> => {
  try {
    // If it's already base64, store it directly
    if (imageUrl.startsWith('data:')) {
      localStorage.setItem(`lingua_img_${word}`, imageUrl);
      return;
    }

    // Otherwise, fetch and convert to base64
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    localStorage.setItem(`lingua_img_${word}`, base64);
  } catch (error) {
    console.error(`Failed to save image for word "${word}":`, error);
  }
};

/**
 * Load image from local storage
 */
export const loadImageFromLocalStorage = (word: string): string | null => {
  return localStorage.getItem(`lingua_img_${word}`);
};

/**
 * Cache all library images to local storage for offline use
 */
export const cacheAllImagesToLocalStorage = async (
  library: LessonWord[],
  onProgress?: (current: number, total: number) => void
): Promise<void> => {
  for (let i = 0; i < library.length; i++) {
    const word = library[i];
    if (onProgress) {
      onProgress(i + 1, library.length);
    }

    await saveImageToLocalStorage(word.word, word.imageUrl);
  }
};
