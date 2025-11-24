import React, { useState, useEffect } from 'react';
import { LessonWord, QuizQuestion } from '../types';
import { CheckCircle, XCircle, ArrowRight, Trophy, X } from 'lucide-react';
import { APP_CONFIG } from '../services/config';
import { markWordAsReviewed } from '../services/storage';

interface QuizModeProps {
  words: LessonWord[];
  onClose: () => void;
  onComplete: (correctCount: number, totalCount: number) => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({ words, onClose, onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    generateQuestions();
  }, [words]);

  const generateQuestions = () => {
    if (words.length === 0) return;

    const quizQuestions: QuizQuestion[] = words.map(word => {
      // Get random wrong answers from other words
      const otherWords = words.filter(w => w.word !== word.word);
      const wrongAnswers: string[] = [];

      while (wrongAnswers.length < APP_CONFIG.QUIZ_OPTIONS_COUNT - 1 && otherWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherWords.length);
        const randomWord = otherWords[randomIndex].word;
        if (!wrongAnswers.includes(randomWord)) {
          wrongAnswers.push(randomWord);
        }
        otherWords.splice(randomIndex, 1);
      }

      // Combine correct answer with wrong answers and shuffle
      const allOptions = [word.word, ...wrongAnswers];
      const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

      return {
        word,
        options: shuffledOptions,
        correctAnswer: word.word
      };
    });

    setQuestions(quizQuestions);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleNext = async () => {
    if (!selectedAnswer || !questions[currentQuestionIndex]) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    // Mark word as reviewed in storage
    if (currentQuestion.word.id) {
      await markWordAsReviewed(currentQuestion.word.id, isCorrect);
    }

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }

    if (!showResult) {
      setShowResult(true);
      return;
    }

    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz finished
      setIsFinished(true);
    }
  };

  const handleFinish = () => {
    onComplete(correctCount, questions.length);
    onClose();
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <p className="text-xl text-slate-400">Pas assez de mots pour un quiz</p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (isFinished) {
    const percentage = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="max-w-2xl w-full bg-slate-900 rounded-3xl border border-white/10 p-8 text-center">
          <div className="inline-block p-4 bg-indigo-500/10 rounded-full mb-6">
            <Trophy className="w-16 h-16 text-indigo-400" />
          </div>

          <h2 className="text-4xl font-bold text-white mb-4">Quiz Terminé!</h2>

          <div className="grid grid-cols-2 gap-6 my-8">
            <div className="bg-black/30 rounded-xl p-6 border border-white/5">
              <div className="text-5xl font-bold text-green-400 mb-2">{correctCount}</div>
              <div className="text-slate-400">Bonnes réponses</div>
            </div>
            <div className="bg-black/30 rounded-xl p-6 border border-white/5">
              <div className="text-5xl font-bold text-white mb-2">{percentage}%</div>
              <div className="text-slate-400">Score</div>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="w-full bg-white hover:bg-indigo-50 text-slate-900 font-bold py-3 px-8 rounded-full transition-colors"
          >
            Terminer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="text-white">
            <span className="text-2xl font-bold">Question {currentQuestionIndex + 1}</span>
            <span className="text-slate-500"> / {questions.length}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            aria-label="Quitter le quiz"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-900 rounded-3xl border border-white/10 overflow-hidden">
          {/* Image */}
          <div className="relative h-80 bg-slate-800">
            <img
              src={currentQuestion.word.imageUrl}
              alt="Question"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          </div>

          {/* Options */}
          <div className="p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Quel est ce mot en français/italien ?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                const showCorrect = showResult && isCorrect;
                const showIncorrect = showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showResult}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 text-lg font-medium
                      ${
                        showCorrect
                          ? 'bg-green-500/20 border-green-500 text-green-400'
                          : showIncorrect
                          ? 'bg-red-500/20 border-red-500 text-red-400'
                          : isSelected
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                          : 'bg-slate-800 border-white/10 text-white hover:border-indigo-500 hover:bg-slate-700'
                      }
                      ${showResult ? 'cursor-default' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showCorrect && <CheckCircle className="w-6 h-6" />}
                      {showIncorrect && <XCircle className="w-6 h-6" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Result Message */}
            {showResult && (
              <div
                className={`p-4 rounded-xl mb-6 ${
                  selectedAnswer === currentQuestion.correctAnswer
                    ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}
              >
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <p className="font-medium">Bravo ! C'est correct ! 🎉</p>
                ) : (
                  <p className="font-medium">
                    Oups ! La bonne réponse était "{currentQuestion.correctAnswer}"
                  </p>
                )}
              </div>
            )}

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
                ${
                  selectedAnswer
                    ? 'bg-white hover:bg-indigo-50 text-slate-900'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }
              `}
            >
              {showResult ? (
                currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Question suivante
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Voir les résultats
                    <Trophy className="w-5 h-5" />
                  </>
                )
              ) : (
                'Valider'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
