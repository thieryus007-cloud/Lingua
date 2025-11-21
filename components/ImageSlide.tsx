import React from 'react';
import { LessonWord } from '../types';

interface ImageSlideProps {
  data: LessonWord;
  isActive: boolean;
}

export const ImageSlide: React.FC<ImageSlideProps> = ({ data, isActive }) => {
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
        
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
        
        {/* Text Container */}
        <div className="absolute bottom-0 left-0 right-0 p-12 pb-20 text-center z-10">
          <h2 className="text-6xl md:text-8xl font-serif font-bold text-white tracking-wide drop-shadow-lg transform transition-all duration-500 translate-y-0 opacity-100">
            {data.word}
          </h2>
          <p className="text-slate-300 text-lg mt-4 uppercase tracking-widest opacity-80">
            Français • Italiano
          </p>
        </div>
      </div>
    </div>
  );
};