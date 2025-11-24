import React, { useState } from 'react';
import { LessonWord } from '../types';
import { CATEGORIES } from '../services/config';
import { X, Save } from 'lucide-react';

interface WordEditorProps {
  word: LessonWord;
  onSave: (word: LessonWord) => void;
  onCancel: () => void;
}

export const WordEditor: React.FC<WordEditorProps> = ({ word, onSave, onCancel }) => {
  const [editedWord, setEditedWord] = useState<LessonWord>({ ...word });
  const [tagInput, setTagInput] = useState('');

  const handleSave = () => {
    onSave(editedWord);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !editedWord.tags?.includes(tagInput.trim())) {
      setEditedWord({
        ...editedWord,
        tags: [...(editedWord.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedWord({
      ...editedWord,
      tags: editedWord.tags?.filter(tag => tag !== tagToRemove)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-slate-900 rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Éditer le mot</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            aria-label="Annuler"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Word (readonly) */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Mot</label>
            <input
              type="text"
              value={editedWord.word}
              disabled
              className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Le mot ne peut pas être modifié</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Catégorie</label>
            <select
              value={editedWord.category || ''}
              onChange={(e) => setEditedWord({ ...editedWord, category: e.target.value as any || undefined })}
              className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Aucune catégorie</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Difficulté</label>
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setEditedWord({ ...editedWord, difficulty: diff })}
                  className={`py-3 rounded-lg font-medium transition-all ${
                    editedWord.difficulty === diff
                      ? diff === 'easy'
                        ? 'bg-green-500 text-white'
                        : diff === 'hard'
                        ? 'bg-red-500 text-white'
                        : 'bg-yellow-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {diff === 'easy' ? 'Facile' : diff === 'hard' ? 'Difficile' : 'Moyen'}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Tags</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ajouter un tag..."
                className="flex-1 px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                Ajouter
              </button>
            </div>
            {editedWord.tags && editedWord.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {editedWord.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm flex items-center gap-2"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-white transition-colors"
                      aria-label={`Retirer le tag ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Notes</label>
            <textarea
              value={editedWord.notes || ''}
              onChange={(e) => setEditedWord({ ...editedWord, notes: e.target.value })}
              placeholder="Ajoutez des notes personnelles..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Stats (readonly) */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
            <div className="text-sm font-medium text-slate-400 mb-3">Statistiques</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{editedWord.reviewCount}</div>
                <div className="text-xs text-slate-500">Révisions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{editedWord.correctCount}</div>
                <div className="text-xs text-slate-500">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{editedWord.incorrectCount}</div>
                <div className="text-xs text-slate-500">Incorrect</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-white/10">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};
