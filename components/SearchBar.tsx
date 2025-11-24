import React from 'react';
import { FilterOptions } from '../types';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES } from '../services/config';

interface SearchBarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ filters, onFiltersChange }) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, searchQuery: e.target.value });
  };

  const handleClearSearch = () => {
    onFiltersChange({ ...filters, searchQuery: '' });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      category: e.target.value ? (e.target.value as any) : undefined
    });
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      difficulty: e.target.value ? (e.target.value as any) : undefined
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      sortBy: e.target.value as any
    });
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      sortOrder: e.target.value as any
    });
  };

  const hasActiveFilters = filters.category || filters.difficulty || filters.sortBy !== 'createdAt';

  return (
    <div className="space-y-4">
      {/* Main Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={handleSearchChange}
          placeholder="Rechercher un mot..."
          className="w-full pl-10 pr-20 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          aria-label="Rechercher un mot"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
          {filters.searchQuery && (
            <button
              onClick={handleClearSearch}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
              aria-label="Effacer la recherche"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-2 rounded-lg transition-colors ${
              hasActiveFilters || showAdvanced
                ? 'bg-indigo-500 text-white'
                : 'hover:bg-slate-700 text-slate-400 hover:text-white'
            }`}
            aria-label="Filtres avancés"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-slate-800/50 rounded-xl border border-white/5">
          {/* Category Filter */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Catégorie</label>
            <select
              value={filters.category || ''}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">Toutes</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Difficulté</label>
            <select
              value={filters.difficulty || ''}
              onChange={handleDifficultyChange}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">Toutes</option>
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Trier par</label>
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="createdAt">Date d'ajout</option>
              <option value="word">Alphabétique</option>
              <option value="reviewCount">Révisions</option>
              <option value="nextReviewDate">Prochaine révision</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Ordre</label>
            <select
              value={filters.sortOrder}
              onChange={handleSortOrderChange}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="desc">Décroissant</option>
              <option value="asc">Croissant</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
