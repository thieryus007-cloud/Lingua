import { Category } from './services/config';

export interface LessonWord {
  id?: number; // ID for IndexedDB
  word: string;
  translation: string;
  imageUrl: string; // Now mandatory as we only save complete items
  createdAt: number;

  // Spaced Repetition System
  lastReviewed?: number; // Timestamp
  reviewCount: number; // Number of times reviewed
  difficulty: 'easy' | 'medium' | 'hard'; // User-rated difficulty
  nextReviewDate?: number; // Calculated next review timestamp
  correctCount: number; // Quiz correct answers
  incorrectCount: number; // Quiz incorrect answers

  // Organization
  category?: Category;
  tags?: string[];

  // User notes
  notes?: string;
}

export enum AppState {
  HOME = 'HOME',
  GENERATING = 'GENERATING', // Building the library
  PLAYING = 'PLAYING',       // Watching the slideshow
  FINISHED = 'FINISHED',
  ERROR = 'ERROR',
  QUIZ = 'QUIZ',            // Quiz mode
  STATS = 'STATS',          // Statistics view
  EDIT = 'EDIT'             // Editing a word
}

export interface GenerationStatus {
  message: string;
  progress: number; // 0 to 100
}

export interface QuizQuestion {
  word: LessonWord;
  options: string[]; // Array of possible answers (including correct one)
  correctAnswer: string;
}

export interface Statistics {
  totalWords: number;
  reviewedToday: number;
  totalReviews: number;
  averageAccuracy: number; // 0-100
  streak: number; // Days of consecutive study
  wordsPerCategory: Record<string, number>;
  difficultyDistribution: Record<'easy' | 'medium' | 'hard', number>;
}

export interface FilterOptions {
  searchQuery: string;
  category?: Category;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  sortBy: 'createdAt' | 'word' | 'reviewCount' | 'nextReviewDate';
  sortOrder: 'asc' | 'desc';
}
