<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LinguaGemini - Apprentissage Visuel Franco-Italien 🇫🇷🇮🇹

Application d'apprentissage de vocabulaire utilisant Gemini AI pour générer des mots cognats (orthographe identique en français et italien) avec images, audio bilingue, et système de révision espacée.

**✨ Fonctionnalités:**
- 🤖 Génération automatique de mots via Gemini AI
- 📸 Reconnaissance d'objets depuis photos
- 🎨 Images générées par IA
- 🔊 Prononciation audio FR/IT
- 📊 Statistiques d'apprentissage
- 🎯 Mode quiz interactif
- 💾 Stockage local (IndexedDB)
- ♿ Accessibilité complète
- 📱 Support PWA

View your app in AI Studio: https://ai.studio/apps/drive/1bXkH99fyQYDR6v3dTSTzXQaG7rPSZvkv

---

## 🚀 Installation & Lancement Local

### Prérequis
- **Node.js** (v18 ou supérieur)
- **npm** ou **yarn**
- Clé API Gemini (gratuite)

> 🍎 **Mac Mini M4 :** Pour configurer Python, zip et pip sans Homebrew, consultez [SETUP_MAC.md](SETUP_MAC.md) ou exécutez :
> ```bash
> chmod +x setup-mac.sh && ./setup-mac.sh
> ```
>
> 🐍 **Erreur pip "externally-managed-environment" ?** Deux solutions :
> - **Solution simple** : Migrez depuis Homebrew → [REMOVE_HOMEBREW_PYTHON.md](REMOVE_HOMEBREW_PYTHON.md) ou `./migrate-from-homebrew.sh`
> - **Solution pro** : Utilisez des environnements virtuels → [PYTHON_VENV_GUIDE.md](PYTHON_VENV_GUIDE.md)

### Étapes

1. **Cloner le dépôt**
   ```bash
   git clone <your-repo-url>
   cd Lingua
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer la clé API**

   Créez un fichier `.env.local` à la racine du projet :
   ```bash
   cp .env.example .env.local
   ```

   Éditez `.env.local` et ajoutez votre clé API Gemini :
   ```
   API_KEY=votre_clé_api_gemini_ici
   ```

   **Obtenir une clé API :** https://aistudio.google.com/app/apikey

4. **Lancer l'application**
   ```bash
   npm run dev
   ```

   L'application sera accessible sur `http://localhost:5173`

5. **Build pour production**
   ```bash
   npm run build
   npm run preview
   ```

---

## 📚 Utilisation

### Ajouter des mots
- **Génération IA :** Cliquez sur "Générer 5 Mots" pour créer automatiquement des cognats
- **Import photo :** Uploadez une photo d'objet pour identification automatique
- **Import JSON :** Importez une bibliothèque existante

### Apprendre
- **Diaporama :** Lance la présentation automatique avec audio bilingue
- **Mode Quiz :** Testez vos connaissances
- **Statistiques :** Suivez votre progression

### Raccourcis clavier
- `Espace` : Pause/Lecture
- `→` : Slide suivante
- `←` : Slide précédente
- `Échap` : Quitter

---

## 🛠️ Structure du Projet

```
Lingua/
├── components/
│   ├── ImageSlide.tsx      # Composant slide diaporama
│   ├── ProgressBar.tsx     # Barre de progression
│   ├── ErrorBoundary.tsx   # Gestion erreurs React
│   └── ...
├── services/
│   ├── gemini.ts           # API Gemini
│   ├── storage.ts          # IndexedDB
│   ├── audio.ts            # Synthèse vocale
│   └── config.ts           # Configuration
├── App.tsx                 # Composant principal
├── types.ts                # Types TypeScript
└── ...
```

---

## 🧪 Tests & Qualité

```bash
# Linter
npm run lint

# Formater le code
npm run format

# Tests (à venir)
npm test
```

---

## 📝 License

MIT

---

## 🙏 Crédits

Propulsé par [Google Gemini AI](https://ai.google.dev/)
