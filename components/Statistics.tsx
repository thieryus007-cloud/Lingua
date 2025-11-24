import React, { useEffect, useState } from 'react';
import { Statistics as StatsType } from '../types';
import { getStatistics } from '../services/storage';
import {
  TrendingUp,
  BookOpen,
  CheckCircle,
  Target,
  Flame,
  PieChart,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface StatisticsProps {
  onClose: () => void;
}

export const Statistics: React.FC<StatisticsProps> = ({ onClose }) => {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to load statistics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <p className="text-xl text-slate-400 mb-4">Impossible de charger les statistiques</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-bold text-white">Statistiques</h1>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Words */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-500/20 rounded-lg">
                <BookOpen className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{stats.totalWords}</div>
            <div className="text-sm text-slate-400">Mots au total</div>
          </div>

          {/* Reviewed Today */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{stats.reviewedToday}</div>
            <div className="text-sm text-slate-400">Révisés aujourd'hui</div>
          </div>

          {/* Total Reviews */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{stats.totalReviews}</div>
            <div className="text-sm text-slate-400">Révisions totales</div>
          </div>

          {/* Accuracy */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Target className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-1">
              {Math.round(stats.averageAccuracy)}%
            </div>
            <div className="text-sm text-slate-400">Précision moyenne</div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Difficulty Distribution */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <PieChart className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Distribution de difficulté</h2>
            </div>

            <div className="space-y-4">
              {Object.entries(stats.difficultyDistribution).map(([difficulty, count]) => {
                const total = stats.totalWords;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const colors = {
                  easy: { bg: 'bg-green-500', text: 'text-green-400', label: 'Facile' },
                  medium: { bg: 'bg-yellow-500', text: 'text-yellow-400', label: 'Moyen' },
                  hard: { bg: 'bg-red-500', text: 'text-red-400', label: 'Difficile' }
                };
                const color = colors[difficulty as keyof typeof colors];

                return (
                  <div key={difficulty}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">{color.label}</span>
                      <span className={`font-medium ${color.text}`}>
                        {count} ({Math.round(percentage)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color.bg} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Categories Distribution */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <PieChart className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Mots par catégorie</h2>
            </div>

            <div className="space-y-3">
              {Object.entries(stats.wordsPerCategory)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([category, count]) => {
                  const total = stats.totalWords;
                  const percentage = total > 0 ? (count / total) * 100 : 0;

                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400 capitalize">{category}</span>
                          <span className="text-white font-medium">{count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {Object.keys(stats.wordsPerCategory).length === 0 && (
              <p className="text-slate-500 text-sm italic text-center py-4">
                Aucune catégorie assignée
              </p>
            )}
          </div>
        </div>

        {/* Streak (placeholder for future implementation) */}
        <div className="mt-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-orange-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Flame className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">{stats.streak} jours</div>
              <div className="text-slate-400">Série en cours</div>
              <div className="text-xs text-slate-500 mt-1">
                (Fonctionnalité à venir - continuez vos révisions quotidiennes!)
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        {stats.totalWords > 0 && (
          <div className="mt-6 bg-slate-900/50 rounded-xl p-6 border border-white/5">
            <h3 className="text-lg font-bold text-white mb-3">Conseils</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              {stats.averageAccuracy < 70 && (
                <li>• Votre précision pourrait être améliorée. Révisez plus souvent les mots difficiles.</li>
              )}
              {stats.reviewedToday === 0 && (
                <li>• Vous n'avez pas révisé aujourd'hui. Faites une session rapide pour maintenir votre progression!</li>
              )}
              {stats.totalWords < 20 && (
                <li>• Ajoutez plus de mots à votre bibliothèque pour enrichir votre vocabulaire.</li>
              )}
              {stats.averageAccuracy >= 90 && (
                <li>• Excellent travail! Votre précision est remarquable. Continuez ainsi! 🎉</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
