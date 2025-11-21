
import React, { useEffect } from 'react';
import { LessonWord } from '../types';
import { Volume2 } from 'lucide-react';

interface ImageSlideProps {
  data: LessonWord;
  isActive: boolean;
  enableAudio: boolean;
}

export const ImageSlide: React.FC<ImageSlideProps> = ({ data, isActive, enableAudio }) => {
  
  useEffect(() => {
    if (isActive && enableAudio) {
      playAudioSequence(data.word);
    }
  }, [isActive, enableAudio, data.word]);

  const playAudioSequence = (text: string) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // French Pronunciation
    const frUtterance = new SpeechSynthesisUtterance(text);
    frUtterance.lang = 'fr-FR';
    frUtterance.rate = 0.9;

    // Italian Pronunciation
    const itUtterance = new SpeechSynthesisUtterance(text);
    itUtterance.lang = 'it-IT';
    itUtterance.rate = 0.9;

    // Sequence: FR -> wait -> IT
    window.speechSynthesis.speak(frUtterance);
    
    // Small pause is handled naturally by the queue, but we can force a silent utterance if needed.
    // Usually queuing them is enough.
    
    window.speechSynthesis.speak(itUtterance);
  };

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center animate-fadeIn">
      {/* Image Container */}
      <div className="relative w-full h-full">
        {data.imageUrl ? (
          <img 
            src={data.imageUrl} 
            alt={data.word} 
            className="w-full h-full object-cover animate-slowZoom"
          />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <span className="text-slate-500">Chargement de l'image...</span>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
        
        {/* Text Container */}
        <div className="absolute bottom-0 left-0 right-0 p-12 pb-24 text-center z-10">
          <h2 className="text-6xl md:text-8xl font-serif font-bold text-white tracking-wide drop-shadow-lg transform transition-all duration-500 translate-y-0 opacity-100">
            {data.word}
          </h2>
          
          <div className="flex items-center justify-center gap-6 mt-6 opacity-90">
             <div className="flex flex-col items-center">
                <span className="text-xs text-blue-400 font-bold tracking-widest uppercase mb-1">Français</span>
                <Volume2 className="w-5 h-5 text-white/50 animate-pulse" />
             </div>
             <div className="w-px h-8 bg-white/20"></div>
             <div className="flex flex-col items-center">
                <span className="text-xs text-green-500 font-bold tracking-widest uppercase mb-1">Italiano</span>
                <Volume2 className="w-5 h-5 text-white/50 animate-pulse delay-1000" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
