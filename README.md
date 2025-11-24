<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LinguaGemini - Apprentissage Visuel Franco-Italien 🇫🇷🇮🇹

Application d'apprentissage de vocabulaire utilisant **Claude AI / Gemini AI** et **vraies photos** pour générer des mots cognats (orthographe identique en français et italien) avec audio bilingue, et système de révision espacée.

**✨ Fonctionnalités:**
- 🤖 Génération automatique de mots via **Claude AI** ou **Gemini AI** (configurable)
- 📸 **Photos réelles** d'objets via Unsplash API (100% fiable)
- 🔍 Reconnaissance d'objets depuis vos photos
- 🔊 Prononciation audio FR/IT
- 📊 Statistiques d'apprentissage
- 🎯 Mode quiz interactif
- 💾 Stockage local (IndexedDB)
- ♿ Accessibilité complète
- 📱 Support PWA
- 🔄 Support Claude AI + Gemini AI (configurable)

View your app in AI Studio: https://ai.studio/apps/drive/1bXkH99fyQYDR6v3dTSTzXQaG7rPSZvkv

---

## 🚀 Installation & Lancement Local

### Prérequis
- **Node.js** (v18 ou supérieur)
- **npm** ou **yarn**
- **Clé API Unsplash** (gratuit, 50 req/h) - https://unsplash.com/developers
- **Clé API Gemini** (gratuit) - https://aistudio.google.com/app/apikey
- Clé API Claude (optionnel, payant) - https://console.anthropic.com/

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

3. **Configurer les clés API**

   Créez un fichier `.env` à la racine du projet :
   ```bash
   cp .env.example .env
   ```

   Éditez `.env` et ajoutez vos clés API :
   ```bash
   # Unsplash API (Required - pour photos réelles)
   UNSPLASH_ACCESS_KEY=votre_access_key_unsplash

   # Gemini API (Required - pour génération de mots)
   API_KEY=votre_clé_api_gemini

   # Claude API (Optionnel - si vous voulez utiliser Claude au lieu de Gemini)
   CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxx
   ```

   **Obtenir les clés API :**
   - **Unsplash** : https://unsplash.com/developers (gratuit, 50 requêtes/heure)
   - **Gemini** : https://aistudio.google.com/app/apikey (gratuit)
   - Claude (optionnel) : https://console.anthropic.com/ (payant)

4. **Lancer l'application**
   ```bash
   npm run dev
   ```

   L'application sera accessible sur `http://localhost:3000`

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
