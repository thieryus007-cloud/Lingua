import { APP_CONFIG } from './config';

/**
 * Play audio sequence for a word in French and Italian
 */
export const playWordAudio = (word: string): void => {
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // French Pronunciation
  const frUtterance = new SpeechSynthesisUtterance(word);
  frUtterance.lang = 'fr-FR';
  frUtterance.rate = APP_CONFIG.SPEECH_RATE;

  // Italian Pronunciation (queued after French)
  const itUtterance = new SpeechSynthesisUtterance(word);
  itUtterance.lang = 'it-IT';
  itUtterance.rate = APP_CONFIG.SPEECH_RATE;

  // Play sequence
  window.speechSynthesis.speak(frUtterance);
  window.speechSynthesis.speak(itUtterance);
};

/**
 * Stop all ongoing speech
 */
export const stopAudio = (): void => {
  window.speechSynthesis.cancel();
};

/**
 * Check if speech synthesis is available
 */
export const isSpeechAvailable = (): boolean => {
  return 'speechSynthesis' in window;
};

/**
 * Get available voices
 */
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  return window.speechSynthesis.getVoices();
};

/**
 * Play audio with specific language
 */
export const playWordInLanguage = (word: string, language: 'fr' | 'it'): void => {
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = language === 'fr' ? 'fr-FR' : 'it-IT';
  utterance.rate = APP_CONFIG.SPEECH_RATE;

  window.speechSynthesis.speak(utterance);
};
