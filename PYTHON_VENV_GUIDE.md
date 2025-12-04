# 🐍 Guide des Environnements Virtuels Python (venv)

Guide complet pour utiliser les environnements virtuels Python sur Mac Mini M4, notamment pour résoudre l'erreur `externally-managed-environment`.

## 🤔 Pourquoi utiliser un environnement virtuel ?

### Le problème

Sur macOS, si Python est géré par Homebrew, vous obtenez cette erreur :

```bash
pip3 install requests
# ❌ error: externally-managed-environment
```

### La solution : venv (environnements virtuels)

Les environnements virtuels créent un **espace isolé** pour chaque projet Python :

- ✅ **Isolation complète** : Chaque projet a ses propres dépendances
- ✅ **Pas de conflit** : Projet A utilise Django 4.0, Projet B utilise Django 5.0 - aucun problème !
- ✅ **Pas besoin de sudo** : Installation dans votre dossier utilisateur
- ✅ **Reproductible** : Partagez facilement avec `requirements.txt`
- ✅ **Nettoyage facile** : Supprimez le dossier, tout disparaît

## 🚀 Démarrage Rapide

### Créer et activer un environnement virtuel

```bash
# 1. Aller dans votre dossier projet
cd ~/Documents/mon-projet

# 2. Créer l'environnement virtuel (une seule fois)
python3 -m venv venv

# 3. Activer l'environnement
source venv/bin/activate

# Votre prompt change pour montrer que venv est actif :
# (venv) user@mac mon-projet %
```

### Installer des packages

```bash
# Une fois activé, pip fonctionne normalement !
pip install requests
pip install pandas numpy matplotlib
pip install --upgrade pip

# Pas besoin de pip3, juste pip !
```

### Désactiver l'environnement

```bash
# Quand vous avez terminé
deactivate

# Votre prompt redevient normal
```

## 📋 Workflow Complet

### Pour un nouveau projet

```bash
# 1. Créer le dossier du projet
mkdir mon-super-projet
cd mon-super-projet

# 2. Créer l'environnement virtuel
python3 -m venv venv

# 3. Activer
source venv/bin/activate

# 4. Installer les dépendances
pip install flask sqlalchemy requests

# 5. Sauvegarder les dépendances
pip freeze > requirements.txt

# 6. Ajouter venv/ au .gitignore
echo "venv/" >> .gitignore
echo "*.pyc" >> .gitignore
echo "__pycache__/" >> .gitignore

# 7. Travailler sur votre projet...
python app.py
```

### Pour un projet existant (avec requirements.txt)

```bash
# 1. Cloner le projet
git clone https://github.com/user/projet.git
cd projet

# 2. Créer l'environnement virtuel
python3 -m venv venv

# 3. Activer
source venv/bin/activate

# 4. Installer toutes les dépendances d'un coup
pip install -r requirements.txt

# 5. Vous êtes prêt à travailler !
python app.py
```

## 🎯 Commandes Essentielles

### Gestion de l'environnement

```bash
# Créer un environnement virtuel
python3 -m venv venv

# Activer (macOS/Linux)
source venv/bin/activate

# Désactiver
deactivate

# Supprimer complètement (désactiver d'abord)
rm -rf venv
```

### Gestion des packages

```bash
# Installer un package
pip install package_name

# Installer une version spécifique
pip install package_name==1.2.3

# Mettre à jour un package
pip install --upgrade package_name

# Désinstaller un package
pip uninstall package_name

# Lister les packages installés
pip list

# Voir les packages obsolètes
pip list --outdated
```

### Gestion de requirements.txt

```bash
# Créer requirements.txt avec toutes les dépendances
pip freeze > requirements.txt

# Installer depuis requirements.txt
pip install -r requirements.txt

# Mettre à jour requirements.txt après ajout de packages
pip freeze > requirements.txt
```

## 🔧 Configuration Avancée

### Créer un environnement avec un nom personnalisé

```bash
# Au lieu de "venv", utilisez ce que vous voulez
python3 -m venv .env
python3 -m venv myenv
python3 -m venv projet-env
```

### Alias pratique pour activer rapidement

Ajoutez à votre `~/.zshrc` :

```bash
# Alias pour activer venv rapidement
alias activate='source venv/bin/activate'
alias vact='source venv/bin/activate'

# Recharger
source ~/.zshrc
```

Maintenant vous pouvez juste taper :
```bash
cd mon-projet
activate  # ou vact
```

### Script d'activation automatique

Créez `~/.zshrc` avec auto-activation :

```bash
# Auto-activer venv si présent dans le dossier
auto_venv() {
  if [ -d "venv" ]; then
    source venv/bin/activate
  fi
}

# Exécuter à chaque changement de dossier
cd() {
  builtin cd "$@" && auto_venv
}
```

## 📦 Template de projet Python

```bash
mon-projet/
├── venv/                 # Environnement virtuel (ne pas commit)
├── src/
│   ├── __init__.py
│   └── main.py
├── tests/
│   └── test_main.py
├── .gitignore           # Inclure venv/
├── requirements.txt     # Dépendances
├── README.md
└── setup.py             # Si vous créez un package
```

### .gitignore recommandé

```bash
# Python
venv/
env/
.venv/
*.pyc
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
dist/
*.egg-info/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Environnement
.env
.env.local
```

## 🆘 Dépannage

### "venv/bin/activate: No such file or directory"

```bash
# Vous n'avez pas créé l'environnement ou vous n'êtes pas dans le bon dossier
pwd  # Vérifier où vous êtes
ls -la  # Vérifier si venv/ existe

# Créer l'environnement
python3 -m venv venv
```

### "command not found: python3"

```bash
# Python n'est pas installé ou pas dans le PATH
which python3

# Installer via Xcode Command Line Tools
xcode-select --install

# Ou télécharger depuis python.org
```

### Impossible de créer venv : "No module named venv"

```bash
# Réinstaller pip et venv
python3 -m ensurepip --upgrade

# Ou installer le package complet Python depuis python.org
```

### L'environnement virtuel ne s'active pas

```bash
# Vérifier les permissions
ls -la venv/bin/activate

# Donner les permissions d'exécution si nécessaire
chmod +x venv/bin/activate

# Essayer d'activer avec le chemin complet
source ./venv/bin/activate
```

### Package installé mais "ModuleNotFoundError"

```bash
# Vérifier que l'environnement virtuel est activé
which python
# Devrait montrer : .../venv/bin/python

# Si non activé
source venv/bin/activate

# Puis réinstaller
pip install package_name
```

## 💡 Bonnes Pratiques

### ✅ À FAIRE

- **Toujours** créer un venv pour chaque projet
- Activer le venv avant d'installer des packages
- Ajouter `venv/` au `.gitignore`
- Maintenir `requirements.txt` à jour
- Utiliser `pip freeze` pour capturer les versions exactes
- Documenter la version de Python requise

### ❌ À ÉVITER

- N'installez **jamais** de packages système avec `sudo pip`
- Ne committez **jamais** le dossier `venv/` dans git
- N'utilisez pas `--break-system-packages`
- N'installez pas tout globalement
- Ne mélangez pas pip et apt/brew pour les packages Python

## 🎓 Pour aller plus loin

### Outils avancés

- **virtualenvwrapper** : Gestionnaire d'environnements virtuels plus puissant
- **pipenv** : Combine pip et virtualenv avec Pipfile
- **poetry** : Gestion moderne des dépendances Python
- **pyenv** : Gérer plusieurs versions de Python

### Commandes pipenv (alternative moderne)

```bash
# Installer pipenv
pip install --user pipenv

# Créer un environnement et installer
pipenv install requests

# Activer le shell
pipenv shell

# Sortir
exit
```

## 📚 Ressources

- [Documentation officielle venv](https://docs.python.org/3/library/venv.html)
- [Guide Python Packaging](https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/)
- [PEP 668 - Externally Managed Environments](https://peps.python.org/pep-0668/)

---

**🎯 En résumé :** Les environnements virtuels sont la solution standard pour gérer des projets Python. Créez-en un pour chaque projet, activez-le avant de travailler, et vous n'aurez jamais de problèmes de dépendances ou de permissions !
