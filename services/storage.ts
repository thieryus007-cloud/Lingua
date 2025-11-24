import { LessonWord, FilterOptions, Statistics } from "../types";
import { APP_CONFIG } from "./config";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(APP_CONFIG.DB_NAME, APP_CONFIG.DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(APP_CONFIG.STORE_NAME)) {
        const store = db.createObjectStore(APP_CONFIG.STORE_NAME, { keyPath: 'id', autoIncrement: true });
        // Create indexes for faster queries
        store.createIndex('word', 'word', { unique: false });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('difficulty', 'difficulty', { unique: false });
        store.createIndex('nextReviewDate', 'nextReviewDate', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Save a new word to the library with default values
 */
export const saveWordToLibrary = async (word: Omit<LessonWord, 'id'>): Promise<number> => {
  const db = await openDB();

  // Set defaults for new fields
  const wordWithDefaults: Omit<LessonWord, 'id'> = {
    reviewCount: 0,
    difficulty: 'medium',
    correctCount: 0,
    incorrectCount: 0,
    ...word,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(APP_CONFIG.STORE_NAME, 'readwrite');
    const store = tx.objectStore(APP_CONFIG.STORE_NAME);
    const request = store.add(wordWithDefaults);

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Update an existing word
 */
export const updateWord = async (word: LessonWord): Promise<void> => {
  if (!word.id) throw new Error('Word ID is required for update');

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(APP_CONFIG.STORE_NAME, 'readwrite');
    const store = tx.objectStore(APP_CONFIG.STORE_NAME);
    const request = store.put(word);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Delete a word by ID
 */
export const deleteWord = async (id: number): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(APP_CONFIG.STORE_NAME, 'readwrite');
    const store = tx.objectStore(APP_CONFIG.STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Get a single word by ID
 */
export const getWordById = async (id: number): Promise<LessonWord | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(APP_CONFIG.STORE_NAME, 'readonly');
    const store = tx.objectStore(APP_CONFIG.STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result as LessonWord | undefined);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Get all words from the library
 */
export const getLibrary = async (): Promise<LessonWord[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(APP_CONFIG.STORE_NAME, 'readonly');
    const store = tx.objectStore(APP_CONFIG.STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as LessonWord[]);
    };
    request.onerror = () => reject(request.error);
  });
};

/**
 * Get filtered and sorted words
 */
export const getFilteredLibrary = async (filters: FilterOptions): Promise<LessonWord[]> => {
  let words = await getLibrary();

  // Apply filters
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    words = words.filter(w =>
      w.word.toLowerCase().includes(query) ||
      w.translation.toLowerCase().includes(query) ||
      w.notes?.toLowerCase().includes(query)
    );
  }

  if (filters.category) {
    words = words.filter(w => w.category === filters.category);
  }

  if (filters.difficulty) {
    words = words.filter(w => w.difficulty === filters.difficulty);
  }

  if (filters.tags && filters.tags.length > 0) {
    words = words.filter(w =>
      w.tags?.some(tag => filters.tags!.includes(tag))
    );
  }

  // Apply sorting
  words.sort((a, b) => {
    const aVal = a[filters.sortBy];
    const bVal = b[filters.sortBy];

    if (aVal === undefined) return 1;
    if (bVal === undefined) return -1;

    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  return words;
};

/**
 * Get words that need review (based on spaced repetition)
 */
export const getWordsForReview = async (): Promise<LessonWord[]> => {
  const words = await getLibrary();
  const now = Date.now();

  return words.filter(w => {
    if (!w.nextReviewDate) return true; // Never reviewed
    return w.nextReviewDate <= now;
  });
};

/**
 * Calculate next review date based on difficulty
 */
export const calculateNextReviewDate = (word: LessonWord): number => {
  const now = Date.now();
  const baseInterval = 24 * 60 * 60 * 1000; // 1 day in ms

  const multiplier = APP_CONFIG.DIFFICULTY_MULTIPLIERS[word.difficulty];
  const reviewFactor = Math.pow(multiplier, word.reviewCount);

  return now + (baseInterval * reviewFactor);
};

/**
 * Mark word as reviewed
 */
export const markWordAsReviewed = async (wordId: number, wasCorrect: boolean): Promise<void> => {
  const word = await getWordById(wordId);
  if (!word) throw new Error('Word not found');

  word.lastReviewed = Date.now();
  word.reviewCount += 1;

  if (wasCorrect) {
    word.correctCount += 1;
  } else {
    word.incorrectCount += 1;
  }

  word.nextReviewDate = calculateNextReviewDate(word);

  await updateWord(word);
};

/**
 * Get statistics for the library
 */
export const getStatistics = async (): Promise<Statistics> => {
  const words = await getLibrary();
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  const totalWords = words.length;
  const reviewedToday = words.filter(w =>
    w.lastReviewed && w.lastReviewed >= todayTimestamp
  ).length;

  const totalReviews = words.reduce((sum, w) => sum + w.reviewCount, 0);

  const totalCorrect = words.reduce((sum, w) => sum + w.correctCount, 0);
  const totalIncorrect = words.reduce((sum, w) => sum + w.incorrectCount, 0);
  const totalAnswers = totalCorrect + totalIncorrect;
  const averageAccuracy = totalAnswers > 0 ? (totalCorrect / totalAnswers) * 100 : 0;

  // Calculate streak (simplified - counts days with reviews)
  const streak = 0; // TODO: Implement proper streak calculation

  // Words per category
  const wordsPerCategory: Record<string, number> = {};
  words.forEach(w => {
    const cat = w.category || 'autre';
    wordsPerCategory[cat] = (wordsPerCategory[cat] || 0) + 1;
  });

  // Difficulty distribution
  const difficultyDistribution: Record<'easy' | 'medium' | 'hard', number> = {
    easy: words.filter(w => w.difficulty === 'easy').length,
    medium: words.filter(w => w.difficulty === 'medium').length,
    hard: words.filter(w => w.difficulty === 'hard').length,
  };

  return {
    totalWords,
    reviewedToday,
    totalReviews,
    averageAccuracy,
    streak,
    wordsPerCategory,
    difficultyDistribution,
  };
};

/**
 * Import words from JSON (merge with existing library)
 */
export const importWords = async (words: LessonWord[]): Promise<number> => {
  let importedCount = 0;
  const existingWords = await getLibrary();
  const existingWordStrings = new Set(existingWords.map(w => w.word.toLowerCase()));

  for (const word of words) {
    // Skip duplicates
    if (existingWordStrings.has(word.word.toLowerCase())) {
      continue;
    }

    // Remove ID to let IndexedDB auto-generate
    const { id, ...wordWithoutId } = word;
    await saveWordToLibrary(wordWithoutId);
    importedCount++;
  }

  return importedCount;
};

/**
 * Clear the entire library
 */
export const clearLibrary = async (): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(APP_CONFIG.STORE_NAME, 'readwrite');
    const store = tx.objectStore(APP_CONFIG.STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
