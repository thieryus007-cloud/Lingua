import React from 'react';
import { LessonWord } from '../types';
import { Edit2, Trash2, Volume2 } from 'lucide-react';
import { playWordAudio } from '../services/audio';

interface WordCardProps {
  word: LessonWord;
  onEdit: (word: LessonWord) => void;
  onDelete: (id: number) => void;
}

export const WordCard: React.FC<WordCardProps> = ({ word, onEdit, onDelete }) => {
  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    playWordAudio(word.word);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(word);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (word.id && window.confirm(`Supprimer "${word.word}" ?`)) {
      onDelete(word.id);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'hard':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Facile';
      case 'hard':
        return 'Difficile';
      default:
        return 'Moyen';
    }
  };

  return (
    <div className="group relative bg-slate-800 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-[1.02]">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-slate-900">
        <img
          src={word.imageUrl}
          alt={word.word}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

        {/* Actions (visible on hover) */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handlePlayAudio}
            className="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white transition-colors"
            aria-label="Écouter la prononciation"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleEdit}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
            aria-label="Modifier le mot"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
            aria-label="Supprimer le mot"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Difficulty Badge */}
        <div className="absolute bottom-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(word.difficulty)}`}>
            {getDifficultyLabel(word.difficulty)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-white mb-1">{word.word}</h3>

        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          {word.category && (
            <span className="px-2 py-1 bg-slate-700 rounded-full">
              {word.category}
            </span>
          )}
          {word.reviewCount > 0 && (
            <span className="px-2 py-1 bg-slate-700 rounded-full">
              Révisé {word.reviewCount}×
            </span>
          )}
        </div>

        {word.tags && word.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {word.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {word.notes && (
          <p className="text-sm text-slate-400 mt-2 line-clamp-2">
            {word.notes}
          </p>
        )}

        {/* Stats */}
        {(word.correctCount > 0 || word.incorrectCount > 0) && (
          <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-xs">
            <span className="text-green-400">✓ {word.correctCount}</span>
            <span className="text-red-400">✗ {word.incorrectCount}</span>
            <span className="text-slate-500">
              {Math.round((word.correctCount / (word.correctCount + word.incorrectCount)) * 100)}% réussite
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
