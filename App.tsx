
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, LessonWord, GenerationStatus } from './types';
import { generateNewWordsBatch, generateImageForWord, identifyWordFromImage } from './services/gemini';
import { getLibrary, saveWordToLibrary, clearLibrary } from './services/storage';
import { ImageSlide } from './components/ImageSlide';
import { ProgressBar } from './components/ProgressBar';
import { Play, Plus, Trash2, Loader2, BookOpen, Sparkles, Library, AlertCircle, Upload, Download, Volume2, VolumeX } from 'lucide-react';

const SLIDE_DURATION = 6000; // Increased to 6s to accommodate audio

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [library, setLibrary] = useState<LessonWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [genStatus, setGenStatus] = useState<GenerationStatus>({ message: '', progress: 0 });
  const [enableAudio, setEnableAudio] = useState(true);
  
  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Playback refs
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // --- Initialization ---
  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const items = await getLibrary();
      setLibrary(items);
    } catch (e) {
      console.error("Failed to load library", e);
    }
  };

  // --- Logic: Add New Words (AI Generation) ---
  const handleAddWords = async (count: number) => {
    setAppState(AppState.GENERATING);
    setGenStatus({ message: 'Recherche de nouveaux mots communs...', progress: 10 });

    try {
      const existingWords = library.map(l => l.word);
      const newWordStrings = await generateNewWordsBatch(count, existingWords);
      
      setGenStatus({ message: `Génération des images (0/${newWordStrings.length})...`, progress: 30 });

      for (let i = 0; i < newWordStrings.length; i++) {
        const wordStr = newWordStrings[i];
        if (existingWords.includes(wordStr)) continue;

        try {
          const imageUrl = await generateImageForWord(wordStr);
          const newEntry: Omit<LessonWord, 'id'> = {
            word: wordStr,
            translation: wordStr,
            imageUrl: imageUrl,
            createdAt: Date.now()
          };
          await saveWordToLibrary(newEntry);
          
          const percent = 30 + Math.floor(((i + 1) / newWordStrings.length) * 70);
          setGenStatus({ 
            message: `Création : ${wordStr} (${i + 1}/${newWordStrings.length})`, 
            progress: percent 
          });

        } catch (e) {
          console.error(`Failed to create card for ${wordStr}`, e);
        }
      }

      await loadLibrary();
      setAppState(AppState.HOME);

    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
    }
  };

  // --- Logic: Upload Photo ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAppState(AppState.GENERATING);
    setGenStatus({ message: 'Analyse de votre image...', progress: 20 });

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        
        // 1. Identify word
        setGenStatus({ message: 'Identification de l\'objet...', progress: 50 });
        const identifiedWord = await identifyWordFromImage(base64String);

        if (!identifiedWord) {
          alert("Désolé, je n'ai pas trouvé d'objet principal qui s'écrit pareil en Français et en Italien dans cette image.");
          setAppState(AppState.HOME);
          return;
        }

        // Check if already exists
        if (library.some(w => w.word.toLowerCase() === identifiedWord.toLowerCase())) {
            alert(`Le mot "${identifiedWord}" est déjà dans votre bibliothèque.`);
            setAppState(AppState.HOME);
            return;
        }

        // 2. Save to library
        setGenStatus({ message: `Ajout de : ${identifiedWord}...`, progress: 80 });
        const newEntry: Omit<LessonWord, 'id'> = {
            word: identifiedWord,
            translation: identifiedWord,
            imageUrl: base64String, // Use user's image!
            createdAt: Date.now()
        };
        
        await saveWordToLibrary(newEntry);
        await loadLibrary();
        setAppState(AppState.HOME);

      } catch (error) {
        console.error("Upload failed", error);
        setAppState(AppState.ERROR);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Logic: Export/Reset ---
  const handleResetLibrary = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir tout effacer ?")) {
      await clearLibrary();
      setLibrary([]);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(library, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lingua_gemini_backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Logic: Playback ---
  const startPlayback = () => {
    if (library.length === 0) return;
    setCurrentIndex(0);
    setAppState(AppState.PLAYING);
  };

  const advanceSlide = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev + 1 >= library.length) {
        setAppState(AppState.FINISHED);
        return prev;
      }
      return prev + 1;
    });
    startTimeRef.current = Date.now();
  }, [library.length]);

  useEffect(() => {
    if (appState === AppState.PLAYING) {
      startTimeRef.current = Date.now();
      
      const loop = () => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        const newProgress = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
        
        setProgress(newProgress);

        if (elapsed >= SLIDE_DURATION) {
          advanceSlide();
        } else {
          timerRef.current = requestAnimationFrame(loop);
        }
      };

      timerRef.current = requestAnimationFrame(loop);
    } else {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      window.speechSynthesis.cancel(); // Stop audio if we leave playing state
    }

    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [appState, currentIndex, advanceSlide]);


  // --- Views ---

  if (appState === AppState.HOME) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950"></div>

        <div className="z-10 max-w-3xl w-full bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          
          <div className="text-center mb-10">
            <h1 className="text-5xl font-serif font-bold text-white mb-2 tracking-tight">LinguaGemini</h1>
            <p className="text-slate-400 text-lg">Apprentissage visuel Franco-Italien</p>
          </div>

          {/* Library Status */}
          <div className="bg-black/30 rounded-2xl p-6 mb-8 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Library className="w-6 h-6 text-indigo-400" />
                </div>
                <h2 className="text-xl font-medium text-white">Votre Bibliothèque</h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-white">{library.length} <span className="text-sm text-slate-500 font-normal">mots</span></span>
              </div>
            </div>
            
            {library.length > 0 ? (
              <div className="flex -space-x-2 overflow-hidden py-2">
                {library.slice(0, 12).map((item, i) => (
                  <img key={i} src={item.imageUrl} alt="" className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-900 object-cover" />
                ))}
                {library.length > 12 && (
                  <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400 ring-2 ring-slate-900">
                    +{library.length - 12}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">Aucun mot enregistré. Commencez par en ajouter.</p>
            )}
          </div>

          {/* Main Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            
            {/* Add via AI */}
            <button 
              onClick={() => handleAddWords(5)}
              className="group flex flex-col items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white p-6 rounded-xl border border-white/10 transition-all duration-200"
            >
              <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <div className="text-center">
                <div className="font-bold">Générer 5 Mots</div>
                <div className="text-xs text-slate-400">Via Gemini AI</div>
              </div>
            </button>

            {/* Add via Upload */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="group flex flex-col items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white p-6 rounded-xl border border-white/10 transition-all duration-200"
            >
              <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-center">
                <div className="font-bold">Importer Photo</div>
                <div className="text-xs text-slate-400">Reconnaissance Visuelle</div>
              </div>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
            />

            {/* Play */}
            <button 
              onClick={startPlayback}
              disabled={library.length === 0}
              className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl transition-all duration-200 shadow-lg
                ${library.length > 0 
                  ? 'bg-white hover:bg-indigo-50 text-slate-900 transform hover:scale-[1.02]' 
                  : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'}`}
            >
              <div className={`p-3 rounded-full ${library.length > 0 ? 'bg-slate-900 text-white' : 'bg-slate-700 text-slate-500'}`}>
                 <Play className="w-6 h-6 fill-current" />
              </div>
              <div className="text-center">
                <div className="font-bold">Lancer Diaporama</div>
                <div className="text-xs text-slate-500/80">Apprendre</div>
              </div>
            </button>
          </div>

          {/* Footer / Utility Actions */}
          <div className="flex justify-center gap-6 pt-4 border-t border-white/5">
             {library.length > 0 && (
               <>
                <button 
                  onClick={handleExport}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Sauvegarder la base (JSON)
                </button>

                <button 
                  onClick={handleResetLibrary}
                  className="text-xs text-red-400/60 hover:text-red-400 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Tout effacer
                </button>
               </>
             )}
          </div>

        </div>
      </div>
    );
  }

  if (appState === AppState.GENERATING) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
            <Loader2 className="w-16 h-16 animate-spin text-indigo-400 relative z-10" />
          </div>
          
          <div>
            <h2 className="text-2xl font-serif font-bold mb-2">Mise à jour de la bibliothèque</h2>
            <p className="text-slate-400 animate-pulse">{genStatus.message}</p>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-indigo-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${genStatus.progress}%` }}
            />
          </div>
          
          <p className="text-xs text-slate-500">
            Base de données locale mise à jour automatiquement.
          </p>
        </div>
      </div>
    );
  }

  if (appState === AppState.PLAYING) {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden">
        {/* Slides */}
        {library.map((wordData, idx) => (
          <ImageSlide 
            key={idx} 
            data={wordData} 
            isActive={idx === currentIndex} 
            enableAudio={enableAudio}
          />
        ))}

        {/* Progress Interface */}
        <div className="absolute top-0 left-0 right-0 p-6 z-50 flex justify-between items-center">
          <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-white border border-white/10">
            {currentIndex + 1} / {library.length}
          </div>

          <div className="flex items-center gap-3">
            <button 
               onClick={() => setEnableAudio(!enableAudio)}
               className="bg-black/30 backdrop-blur-md p-2 rounded-full text-white/80 hover:bg-white/10 border border-white/10 transition-colors"
            >
               {enableAudio ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            
            <div 
              onClick={() => setAppState(AppState.HOME)}
              className="cursor-pointer bg-black/30 backdrop-blur-md px-4 py-2 rounded-full text-xs font-medium text-white/70 hover:bg-white/10 border border-white/10 transition-colors"
            >
              QUITTER
            </div>
          </div>
        </div>

        {/* Time Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-50">
           <ProgressBar progress={progress} />
        </div>
      </div>
    );
  }

  if (appState === AppState.FINISHED) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 relative overflow-hidden">
        <div className="z-10 text-center p-8 max-w-2xl w-full">
          <div className="inline-block p-4 bg-green-500/10 rounded-full mb-6 border border-green-500/20">
            <Sparkles className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-4xl font-serif font-bold text-white mb-4">Session Terminée</h2>
          <p className="text-slate-300 mb-8">
            Vous avez révisé {library.length} mots aujourd'hui.
          </p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => { setCurrentIndex(0); setAppState(AppState.PLAYING); }}
              className="bg-white text-slate-900 font-bold py-3 px-8 rounded-full hover:bg-indigo-50 transition-colors"
            >
              Revoir encore
            </button>
            <button 
              onClick={() => setAppState(AppState.HOME)}
              className="text-slate-400 hover:text-white py-2 transition-colors"
            >
              Retour au menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (appState === AppState.ERROR) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-red-400 mb-2">Une erreur est survenue</h2>
        <p className="text-slate-400 mb-6">Soit l'image n'a pas pu être analysée, soit la connexion a échoué.</p>
        <button 
          onClick={() => setAppState(AppState.HOME)}
          className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Retour au menu
        </button>
      </div>
    );
  }

  return null;
};

export default App;
