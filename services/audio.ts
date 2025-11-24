import { APP_CONFIG } from './config';

// Voice loading state
let voicesLoaded = false;
let voiceLoadPromise: Promise<void> | null = null;

/**
 * Ensure voices are loaded before using them
 */
const ensureVoicesLoaded = (): Promise<void> => {
  if (voicesLoaded) {
    return Promise.resolve();
  }

  if (voiceLoadPromise) {
    return voiceLoadPromise;
  }

  voiceLoadPromise = new Promise((resolve) => {
    // Check if voices are already available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
      resolve();
      return;
    }

    // Wait for voiceschanged event
    const handleVoicesChanged = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesLoaded = true;
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve();
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    // Fallback timeout after 2 seconds
    setTimeout(() => {
      voicesLoaded = true;
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      resolve();
    }, 2000);
  });

  return voiceLoadPromise;
};

/**
 * Play audio sequence for a word in French and Italian
 */
export const playWordAudio = async (word: string): Promise<void> => {
  // Ensure voices are loaded
  await ensureVoicesLoaded();

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Small delay to ensure cancel is processed
  await new Promise(resolve => setTimeout(resolve, 50));

  // French Pronunciation
  const frUtterance = new SpeechSynthesisUtterance(word);
  frUtterance.lang = 'fr-FR';
  frUtterance.rate = APP_CONFIG.SPEECH_RATE;
  frUtterance.volume = 1.0;

  // Italian Pronunciation (queued after French)
  const itUtterance = new SpeechSynthesisUtterance(word);
  itUtterance.lang = 'it-IT';
  itUtterance.rate = APP_CONFIG.SPEECH_RATE;
  itUtterance.volume = 1.0;

  // Play sequence
  window.speechSynthesis.speak(frUtterance);

  // Add a small delay between languages
  frUtterance.onend = () => {
    setTimeout(() => {
      window.speechSynthesis.speak(itUtterance);
    }, APP_CONFIG.PAUSE_BETWEEN_LANGUAGES);
  };
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
export const playWordInLanguage = async (word: string, language: 'fr' | 'it'): Promise<void> => {
  await ensureVoicesLoaded();

  window.speechSynthesis.cancel();
  await new Promise(resolve => setTimeout(resolve, 50));

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = language === 'fr' ? 'fr-FR' : 'it-IT';
  utterance.rate = APP_CONFIG.SPEECH_RATE;
  utterance.volume = 1.0;

  window.speechSynthesis.speak(utterance);
};
