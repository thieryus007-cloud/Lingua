# 🚀 Démarrage Rapide - Mac Mini M4

Guide ultra-rapide pour configurer Python, zip et pip sans Homebrew.

## ⚡ Installation Express (2 minutes)

### Option 1 : Script Automatique (Recommandé)

```bash
# Dans le dossier Lingua
chmod +x setup-mac.sh
./setup-mac.sh
```

Le script va :
- ✅ Vérifier ce qui est installé
- ✅ Configurer le PATH automatiquement
- ✅ Créer des alias pratiques
- ✅ Sauvegarder votre config actuelle

### Option 2 : Installation Manuelle

```bash
# 1. Installer Xcode Command Line Tools
xcode-select --install

# 2. Vérifier l'installation
python3 --version
pip3 --version
zip --version

# 3. Configurer le PATH (copier-coller dans le terminal)
cat >> ~/.zshrc << 'EOF'

# Python PATH Configuration
export PATH="/usr/local/bin:$PATH"
export PATH="/Library/Frameworks/Python.framework/Versions/Current/bin:$PATH"
alias python=python3
alias pip=pip3
EOF

# 4. Recharger la configuration
source ~/.zshrc
```

## ✅ Vérification

Dans un **nouveau terminal**, exécutez :

```bash
python3 --version  # Devrait afficher la version de Python
pip3 --version     # Devrait afficher la version de pip
zip --version      # Devrait afficher la version de zip
```

## 🎯 Commandes Utiles

```bash
# Installer un package Python
pip3 install nom_du_package

# Créer un environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Créer une archive zip
zip -r archive.zip dossier/

# Mettre à jour pip
pip3 install --upgrade pip
```

## 🆘 Problèmes ?

### Python3 non trouvé
```bash
# Option A : Installer Xcode Command Line Tools
xcode-select --install

# Option B : Télécharger depuis python.org
# https://www.python.org/downloads/
```

### pip3 non trouvé
```bash
python3 -m ensurepip --upgrade
python3 -m pip install --upgrade pip
```

### Les changements ne s'appliquent pas
```bash
# Recharger la configuration
source ~/.zshrc

# Ou ouvrir un nouveau terminal
```

## 📚 Documentation Complète

Pour plus de détails, consultez [SETUP_MAC.md](SETUP_MAC.md)

---

**💡 Astuce :** Si vous avez des alias configurés, vous pouvez utiliser `python` et `pip` au lieu de `python3` et `pip3`.
