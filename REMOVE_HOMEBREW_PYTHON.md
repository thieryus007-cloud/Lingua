# 🔄 Migration : Désinstaller Python de Homebrew vers Installation Native

Guide complet pour désinstaller Python de Homebrew et installer une version native non contraignante sur Mac Mini M4.

## 🎯 Objectif

Passer de Python géré par Homebrew (qui bloque pip avec `externally-managed-environment`) à une installation native qui permet d'utiliser pip directement sans environnement virtuel.

## ⚡ Installation Express (Automatique)

Utilisez le script automatique qui fait tout pour vous :

```bash
chmod +x migrate-from-homebrew.sh
./migrate-from-homebrew.sh
```

Le script va :
1. ✅ Détecter les versions Python installées
2. ✅ Sauvegarder vos packages actuels
3. ✅ Désinstaller Python de Homebrew
4. ✅ Télécharger et installer Python depuis python.org
5. ✅ Configurer le PATH
6. ✅ Réinstaller vos packages

## 📋 Installation Manuelle (Étape par étape)

### Étape 1 : Vérifier ce qui est installé

```bash
# Vérifier où se trouve Python
which python3
# Si le résultat contient "/opt/homebrew" ou "Cellar", c'est Homebrew

# Lister les versions Python installées par Homebrew
brew list | grep python

# Exemple de sortie :
# python@3.11
# python@3.12
```

### Étape 2 : Sauvegarder vos packages Python

```bash
# Créer un fichier de sauvegarde de tous vos packages
pip3 list --format=freeze > ~/python_packages_backup.txt

# Afficher ce qui sera sauvegardé
cat ~/python_packages_backup.txt
```

### Étape 3 : Désinstaller Python de Homebrew

```bash
# Désinstaller toutes les versions Python
brew uninstall python@3.11
brew uninstall python@3.12
brew uninstall python@3.13
brew uninstall python  # Si vous avez juste "python"

# Ou désinstaller toutes les versions d'un coup
brew list | grep python | xargs brew uninstall

# Vérifier que Python n'est plus là
which python3
# Devrait afficher : python3 not found (normal, on va le réinstaller)
```

### Étape 4 : Nettoyer les traces de Homebrew

```bash
# Supprimer les liens symboliques Homebrew
sudo rm -f /usr/local/bin/python*
sudo rm -f /usr/local/bin/pip*

# Nettoyer Homebrew
brew cleanup
```

### Étape 5 : Télécharger Python depuis python.org

**Option A : Téléchargement manuel (Recommandé)**

1. Allez sur https://www.python.org/downloads/
2. Cliquez sur le gros bouton "Download Python 3.x.x"
3. **Important :** Téléchargez la version **"macOS 64-bit universal2 installer"**
4. Ouvrez le fichier `.pkg` téléchargé
5. Suivez l'assistant d'installation (acceptez tous les paramètres par défaut)

**Option B : Téléchargement via terminal**

```bash
# Télécharger Python 3.12.7 (version stable)
cd ~/Downloads
curl -O https://www.python.org/ftp/python/3.12.7/python-3.12.7-macos11.pkg

# Installer
sudo installer -pkg python-3.12.7-macos11.pkg -target /
```

### Étape 6 : Vérifier l'installation

```bash
# Vérifier que Python est installé
which python3
# Devrait afficher : /usr/local/bin/python3 ou /Library/Frameworks/Python.framework/...

# Vérifier la version
python3 --version

# Vérifier pip
pip3 --version

# Vérifier que ce n'est PAS Homebrew
python3 -c "import sys; print(sys.prefix)"
# Ne devrait PAS contenir "homebrew" ou "Cellar"
```

### Étape 7 : Configurer le PATH (si nécessaire)

Si `which python3` ne trouve rien, ajoutez Python au PATH :

```bash
# Ouvrir le fichier de configuration
nano ~/.zshrc

# Ajouter ces lignes à la fin
export PATH="/Library/Frameworks/Python.framework/Versions/3.12/bin:$PATH"
export PATH="/usr/local/bin:$PATH"

# Alias pratiques
alias python=python3
alias pip=pip3

# Sauvegarder (Ctrl+O, Enter, Ctrl+X)

# Recharger
source ~/.zshrc
```

### Étape 8 : Tester pip (sans environnement virtuel !)

```bash
# Mettre à jour pip (devrait fonctionner maintenant !)
pip3 install --upgrade pip

# Si ça marche, vous avez réussi ! 🎉
```

### Étape 9 : Réinstaller vos anciens packages (optionnel)

```bash
# Réinstaller les packages que vous aviez sauvegardés
pip3 install -r ~/python_packages_backup.txt

# Ou installer seulement ce dont vous avez besoin
pip3 install requests pandas numpy
```

## ✅ Vérification Finale

Testez que tout fonctionne :

```bash
# Ces commandes devraient toutes fonctionner SANS erreur
python3 --version
pip3 --version
pip3 list

# Tester une installation
pip3 install cowsay
python3 -c "import cowsay; cowsay.cow('Success!')"

# Nettoyer
pip3 uninstall cowsay -y
```

Si `pip3 install --upgrade pip` fonctionne **sans erreur**, vous avez réussi ! ✨

## 🎯 Avantages de cette installation

✅ **Pas d'environnement virtuel obligatoire** - Utilisez pip directement
✅ **Pas d'erreur "externally-managed-environment"** - pip fonctionne normalement
✅ **Installation globale** - Tous vos scripts Python fonctionnent partout
✅ **Plus simple** - Pas de `source venv/bin/activate` à chaque fois
✅ **Installation officielle** - Directement depuis Python.org

## ⚠️ Notes Importantes

### Quand utiliser quand même des environnements virtuels ?

Même avec cette installation, les environnements virtuels restent **recommandés** pour :
- Projets avec des dépendances complexes
- Projets que vous partagez avec d'autres
- Projets professionnels
- Éviter les conflits entre versions de packages

### Installation utilisateur vs système

Avec cette installation, vous pouvez :

```bash
# Installation globale (accessible partout)
pip3 install package_name

# Installation utilisateur (plus sûr, dans ~/.local)
pip3 install --user package_name
```

### Si vous réinstallez Homebrew plus tard

Si vous réinstallez Python via Homebrew :
```bash
# Ne PAS installer python avec brew
brew install something-else

# Si brew installe python comme dépendance, ignorer le python de brew en prioritisant le vôtre
# Votre PATH est déjà configuré pour utiliser /Library/Frameworks/... en premier
```

## 🔍 Dépannage

### Python toujours pas trouvé après installation

```bash
# Vérifier où Python s'est installé
ls /Library/Frameworks/Python.framework/Versions/

# Ajouter explicitement au PATH (remplacer 3.12 par votre version)
export PATH="/Library/Frameworks/Python.framework/Versions/3.12/bin:$PATH"
echo 'export PATH="/Library/Frameworks/Python.framework/Versions/3.12/bin:$PATH"' >> ~/.zshrc
```

### L'erreur "externally-managed-environment" persiste

```bash
# Vérifier que vous utilisez bien le nouveau Python
which python3
python3 -c "import sys; print(sys.prefix)"

# Si le résultat contient encore "homebrew", nettoyez complètement :
brew uninstall --force python@3.11 python@3.12
sudo rm -rf /opt/homebrew/Cellar/python*
sudo rm -rf /usr/local/Cellar/python*

# Réinstaller depuis python.org
```

### pip3 commande non trouvée

```bash
# Réinstaller pip
python3 -m ensurepip --upgrade

# Mettre à jour pip
python3 -m pip install --upgrade pip

# Créer un lien symbolique
sudo ln -s /Library/Frameworks/Python.framework/Versions/3.12/bin/pip3 /usr/local/bin/pip3
```

### Conflits avec l'ancien Python

```bash
# Lister tous les Python installés
which -a python python3

# Nettoyer les anciens liens
sudo rm /usr/local/bin/python3
sudo ln -s /Library/Frameworks/Python.framework/Versions/3.12/bin/python3 /usr/local/bin/python3
```

## 📚 Versions Recommandées

- **Python 3.12.x** - Version stable actuelle (recommandée)
- **Python 3.11.x** - Version stable précédente (très stable)
- **Python 3.13.x** - Version la plus récente (peut avoir des bugs)

Pour ce guide, nous recommandons **Python 3.12.7**.

## 🚀 Après l'installation

### Configuration recommandée

Ajoutez à votre `~/.zshrc` :

```bash
# Python Configuration
export PATH="/Library/Frameworks/Python.framework/Versions/3.12/bin:$PATH"
export PATH="/usr/local/bin:$PATH"

# Alias pratiques
alias python=python3
alias pip=pip3

# Cache pip dans le dossier utilisateur
export PIP_USER=true
```

### Packages utiles à installer

```bash
# Outils de base
pip3 install --upgrade pip setuptools wheel

# Si vous faites du web
pip3 install requests beautifulsoup4

# Si vous faites de la data science
pip3 install pandas numpy matplotlib

# Si vous faites du machine learning
pip3 install scikit-learn tensorflow
```

## 💡 Conseils

1. **Gardez Python à jour** : Vérifiez régulièrement les mises à jour sur python.org
2. **N'installez pas Python via Homebrew** : Utilisez toujours python.org
3. **Mettez à jour pip régulièrement** : `pip3 install --upgrade pip`
4. **Documentez vos packages** : Créez un `requirements.txt` pour vos projets

## ✨ Résultat Final

Après cette migration :

```bash
# Avant (Homebrew)
pip3 install requests
# ❌ error: externally-managed-environment

# Après (python.org)
pip3 install requests
# ✅ Successfully installed requests-2.31.0
```

**C'est tout !** Vous pouvez maintenant utiliser Python et pip normalement, sans contraintes ! 🎉
