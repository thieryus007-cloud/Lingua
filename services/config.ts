// Application Configuration

export const APP_CONFIG = {
  // AI Service Configuration
  USE_CLAUDE: true, // Set to true to use Claude API instead of Gemini
  USE_UNSPLASH: true, // Set to true to use real photos instead of generated images

  // Slideshow
  SLIDE_DURATION: 6000, // 6 seconds

  // Word Generation
  WORDS_PER_BATCH: 5,
  MAX_EXCLUDED_WORDS_SAMPLE: 50, // Only send last N words to avoid huge prompts

  // UI
  MAX_LIBRARY_PREVIEW: 12, // Number of word thumbnails to show in library

  // Storage
  DB_NAME: 'LinguaGeminiDB',
  STORE_NAME: 'words',
  DB_VERSION: 1,

  // Image Optimization
  MAX_IMAGE_SIZE: 800, // Max width/height for generated images
  IMAGE_QUALITY: 0.85, // JPEG quality (0-1)

  // Audio
  SPEECH_RATE: 0.9,
  PAUSE_BETWEEN_LANGUAGES: 500, // ms

  // Spaced Repetition
  DIFFICULTY_MULTIPLIERS: {
    easy: 2.5,
    medium: 1.5,
    hard: 1.0
  },

  // Quiz
  QUIZ_OPTIONS_COUNT: 4,

  // Models
  GEMINI_TEXT_MODEL: 'gemini-2.5-flash',
  GEMINI_IMAGE_MODEL: 'gemini-2.5-flash-image',

  // Fallback
  FALLBACK_IMAGE_URL: 'https://picsum.photos/seed',
} as const;

export const CATEGORIES = [
  'animaux',
  'objets',
  'nature',
  'nourriture',
  'transport',
  'musique',
  'sport',
  'autre'
] as const;

export type Category = typeof CATEGORIES[number];
