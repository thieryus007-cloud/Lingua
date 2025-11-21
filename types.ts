
export interface LessonWord {
  id?: number; // ID for IndexedDB
  word: string;
  translation: string;
  imageUrl: string; // Now mandatory as we only save complete items
  createdAt: number;
}

export enum AppState {
  HOME = 'HOME',
  GENERATING = 'GENERATING', // Building the library
  PLAYING = 'PLAYING',       // Watching the slideshow
  FINISHED = 'FINISHED',
  ERROR = 'ERROR'
}

export interface GenerationStatus {
  message: string;
  progress: number; // 0 to 100
}
