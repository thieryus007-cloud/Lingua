# Configuration Python, zip et pip sur Mac Mini M4

Ce guide vous permet d'installer et configurer Python, zip et pip **sans Homebrew** de manière permanente sur votre Mac Mini M4.

## ✅ Vérification initiale

Ouvrez le Terminal et vérifiez ce qui est déjà installé :

```bash
# Vérifier Python
python3 --version

# Vérifier zip (normalement déjà présent sur macOS)
zip --version

# Vérifier pip
pip3 --version
```

## 📦 Option 1 : Xcode Command Line Tools (Recommandé)

**Avantages :** Gratuit, officiel Apple, inclut Python 3 et les outils de développement de base.

### Installation

```bash
# Installer Xcode Command Line Tools
xcode-select --install
```

Une fenêtre pop-up apparaîtra. Cliquez sur "Installer" et acceptez les conditions.

### Vérification après installation

```bash
# Vérifier que Python est disponible
which python3
python3 --version

# Vérifier pip
pip3 --version

# Si pip n'est pas installé, l'installer manuellement
python3 -m ensurepip --upgrade
```

## 📦 Option 2 : Installation depuis python.org

**Avantages :** Version la plus récente de Python, installation simple.

### Étapes

1. Téléchargez l'installateur macOS depuis [python.org/downloads](https://www.python.org/downloads/)
2. Choisissez **"macOS 64-bit universal2 installer"** pour Mac M4
3. Lancez le fichier `.pkg` téléchargé
4. Suivez l'assistant d'installation
5. L'installateur configure automatiquement le PATH

### Vérification après installation

```bash
python3 --version
pip3 --version
```

## 🔧 Configuration permanente du PATH

Pour que Python et pip soient toujours accessibles, ajoutez-les à votre PATH de manière permanente.

### Pour macOS Catalina et plus récent (shell par défaut : zsh)

```bash
# Ouvrir le fichier de configuration
nano ~/.zshrc

# Ajouter ces lignes à la fin du fichier
export PATH="/usr/local/bin:$PATH"
export PATH="/Library/Frameworks/Python.framework/Versions/Current/bin:$PATH"

# Créer des alias pratiques
alias python=python3
alias pip=pip3

# Sauvegarder (Ctrl+O, Enter, puis Ctrl+X)

# Recharger la configuration
source ~/.zshrc
```

### Pour macOS plus ancien (shell : bash)

```bash
# Ouvrir le fichier de configuration
nano ~/.bash_profile

# Ajouter ces lignes à la fin du fichier
export PATH="/usr/local/bin:$PATH"
export PATH="/Library/Frameworks/Python.framework/Versions/Current/bin:$PATH"

# Créer des alias pratiques
alias python=python3
alias pip=pip3

# Sauvegarder (Ctrl+O, Enter, puis Ctrl+X)

# Recharger la configuration
source ~/.bash_profile
```

## 🚀 Script d'installation automatique

Nous avons créé un script qui automatise tout le processus. Exécutez :

```bash
chmod +x setup-mac.sh
./setup-mac.sh
```

## ✅ Vérification finale

Après l'installation et la configuration :

```bash
# Ces commandes devraient toutes fonctionner
python3 --version
pip3 --version
zip --version

# Si vous avez créé les alias
python --version
pip --version
```

## 📝 Utilisation dans ce projet

Une fois configuré, vous pouvez utiliser Python et pip dans le projet :

```bash
# Installer des dépendances Python (si nécessaire)
pip3 install requests

# Créer un environnement virtuel (recommandé pour les projets Python)
python3 -m venv venv
source venv/bin/activate

# Créer des archives zip
zip -r backup.zip src/
```

## 🔍 Dépannage

### Python3 commande introuvable

Si `python3` n'est pas trouvé après installation :

```bash
# Vérifier l'emplacement de Python
which -a python python3

# Vérifier le PATH
echo $PATH

# Recharger la configuration du shell
source ~/.zshrc  # ou source ~/.bash_profile
```

### pip3 ne fonctionne pas

```bash
# Installer/réinstaller pip
python3 -m ensurepip --upgrade

# Mettre à jour pip
python3 -m pip install --upgrade pip

# Utiliser pip via module Python
python3 -m pip install nom_du_package
```

### Erreur "externally-managed-environment" avec pip

Si vous obtenez cette erreur :
```
error: externally-managed-environment
× This environment is externally managed
```

**Cause :** Votre Python est géré par Homebrew, qui protège l'installation système.

**Vérifier si Python vient de Homebrew :**
```bash
which python3
# Si le résultat contient "/opt/homebrew" ou "/usr/local/Cellar", c'est Homebrew

python3 -c "import sys; print(sys.prefix)"
# Même chose, vérifier si le chemin contient "homebrew" ou "Cellar"
```

**Solution 1 : Utiliser des environnements virtuels (RECOMMANDÉ)**

Les environnements virtuels sont la **meilleure pratique** pour les projets Python :

```bash
# Créer un environnement virtuel dans votre projet
cd /chemin/vers/votre/projet
python3 -m venv venv

# Activer l'environnement virtuel
source venv/bin/activate

# Maintenant pip fonctionne sans erreur !
pip install --upgrade pip
pip install requests numpy pandas  # etc.

# Désactiver quand vous avez terminé
deactivate
```

**Avantages des environnements virtuels :**
- ✅ Isolation des dépendances par projet
- ✅ Pas de conflit entre projets
- ✅ Pas besoin de droits administrateur
- ✅ Facile à recréer et partager (via requirements.txt)

**Solution 2 : Installation utilisateur (pour outils globaux)**

Pour installer des outils que vous voulez utiliser partout :

```bash
# Installer avec --user (dans votre dossier utilisateur)
python3 -m pip install --user nom_du_package

# Mettre à jour pip
python3 -m pip install --user --upgrade pip
```

**Solution 3 : Désinstaller Python de Homebrew et réinstaller**

Si vous voulez vraiment éviter Homebrew :

```bash
# 1. Désinstaller Python de Homebrew
brew uninstall python@3.11  # ou python@3.12, vérifier avec: brew list | grep python

# 2. Télécharger l'installateur officiel depuis python.org
# Allez sur https://www.python.org/downloads/
# Téléchargez "macOS 64-bit universal2 installer"

# 3. Installer le fichier .pkg téléchargé

# 4. Vérifier que Python n'est plus géré par Homebrew
which python3
# Devrait afficher: /usr/local/bin/python3 ou /Library/Frameworks/...

# 5. Maintenant pip fonctionne normalement
pip3 install --upgrade pip
```

**⚠️ Important :** N'utilisez JAMAIS `--break-system-packages` sauf si vous savez exactement ce que vous faites. Cela peut casser votre installation Python.

**💡 Recommandation :** Utilisez **toujours** des environnements virtuels pour vos projets Python. C'est la meilleure pratique universelle.

### zip déjà présent sur macOS

`zip` est normalement préinstallé sur tous les Mac. Si ce n'est pas le cas :

```bash
# Vérifier l'emplacement
which zip

# Il devrait être dans /usr/bin/zip
# Si absent, installer Xcode Command Line Tools
xcode-select --install
```

## 📚 Ressources

- [Documentation Python officielle](https://www.python.org/downloads/macos/)
- [Guide Apple Developer Tools](https://developer.apple.com/xcode/)
- [Guide pip](https://pip.pypa.io/en/stable/installation/)

## 💡 Conseils

1. **N'utilisez jamais sudo avec pip** : Cela peut causer des problèmes de permissions
2. **Utilisez des environnements virtuels** : `python3 -m venv` pour isoler les dépendances
3. **Mettez à jour pip régulièrement** : `pip3 install --upgrade pip`
4. **zip est toujours disponible** : C'est un outil système standard sur macOS
