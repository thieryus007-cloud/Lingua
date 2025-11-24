import { APP_CONFIG } from './config';

/**
 * Fetch a real photo from Unsplash API for a given word
 * @param word The word to search for
 */
export const fetchPhotoFromUnsplash = async (word: string): Promise<string> => {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!apiKey) {
    console.warn('UNSPLASH_ACCESS_KEY not found, using fallback image');
    return `${APP_CONFIG.FALLBACK_IMAGE_URL}/${word}/${APP_CONFIG.MAX_IMAGE_SIZE}/${APP_CONFIG.MAX_IMAGE_SIZE}`;
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        word
      )}&per_page=1&orientation=squarish&content_filter=high`,
      {
        headers: {
          Authorization: `Client-ID ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Get the regular size image (best balance between quality and loading time)
      return data.results[0].urls.regular;
    }

    // No results found, use fallback
    return `${APP_CONFIG.FALLBACK_IMAGE_URL}/${word}/${APP_CONFIG.MAX_IMAGE_SIZE}/${APP_CONFIG.MAX_IMAGE_SIZE}`;
  } catch (error) {
    console.error(`Error fetching photo for "${word}":`, error);
    // Return fallback image on error
    return `${APP_CONFIG.FALLBACK_IMAGE_URL}/${word}/${APP_CONFIG.MAX_IMAGE_SIZE}/${APP_CONFIG.MAX_IMAGE_SIZE}`;
  }
};

/**
 * Prefetch multiple photos in parallel
 * @param words Array of words to fetch photos for
 */
export const prefetchPhotos = async (
  words: string[]
): Promise<Map<string, string>> => {
  const photoMap = new Map<string, string>();

  // Fetch all photos in parallel
  const promises = words.map(async word => {
    const url = await fetchPhotoFromUnsplash(word);
    return { word, url };
  });

  const results = await Promise.all(promises);

  results.forEach(({ word, url }) => {
    photoMap.set(word, url);
  });

  return photoMap;
};

/**
 * Alternative: Fetch from Pexels API (fallback option)
 */
export const fetchPhotoFromPexels = async (word: string): Promise<string> => {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    return `${APP_CONFIG.FALLBACK_IMAGE_URL}/${word}/${APP_CONFIG.MAX_IMAGE_SIZE}/${APP_CONFIG.MAX_IMAGE_SIZE}`;
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(
        word
      )}&per_page=1&orientation=square`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.large;
    }

    return `${APP_CONFIG.FALLBACK_IMAGE_URL}/${word}/${APP_CONFIG.MAX_IMAGE_SIZE}/${APP_CONFIG.MAX_IMAGE_SIZE}`;
  } catch (error) {
    console.error(`Error fetching photo from Pexels for "${word}":`, error);
    return `${APP_CONFIG.FALLBACK_IMAGE_URL}/${word}/${APP_CONFIG.MAX_IMAGE_SIZE}/${APP_CONFIG.MAX_IMAGE_SIZE}`;
  }
};
