# 🍎 Configuration Python sur Mac Mini M4 - Guide Complet

Tous les guides et scripts pour configurer Python, pip et zip sur votre Mac Mini M4.

## 🎯 Quel guide utiliser ?

### Vous avez l'erreur "externally-managed-environment" ?

```
error: externally-managed-environment
× This environment is externally managed
```

➡️ **2 solutions au choix :**

#### Option 1 : Migration vers installation native (PLUS SIMPLE)
**Recommandé si vous voulez utiliser pip directement sans contraintes**

```bash
chmod +x migrate-from-homebrew.sh
./migrate-from-homebrew.sh
```

📖 **Guide complet :** [REMOVE_HOMEBREW_PYTHON.md](REMOVE_HOMEBREW_PYTHON.md)

**Avantages :**
- ✅ pip fonctionne directement, sans environnement virtuel
- ✅ Pas de `source venv/bin/activate` à chaque fois
- ✅ Installation globale simple
- ✅ Idéal pour usage personnel et scripts

#### Option 2 : Environnements virtuels (MEILLEURE PRATIQUE)
**Recommandé pour projets professionnels ou partagés**

```bash
cd votre-projet
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
```

📖 **Guide complet :** [PYTHON_VENV_GUIDE.md](PYTHON_VENV_GUIDE.md)

**Avantages :**
- ✅ Isolation complète par projet
- ✅ Pas de conflit entre versions
- ✅ Meilleure pratique professionnelle
- ✅ Reproductible et partageable

---

### Vous n'avez pas encore Python ?

#### Installation nouvelle

```bash
chmod +x setup-mac.sh
./setup-mac.sh
```

📖 **Guides :**
- **Démarrage rapide :** [QUICKSTART_MAC.md](QUICKSTART_MAC.md)
- **Guide complet :** [SETUP_MAC.md](SETUP_MAC.md)

---

## 📚 Index des fichiers

| Fichier | Description | Quand l'utiliser |
|---------|-------------|------------------|
| **QUICKSTART_MAC.md** | Guide de démarrage rapide | Vous débutez avec Mac M4 |
| **SETUP_MAC.md** | Guide détaillé d'installation | Vous voulez tous les détails |
| **REMOVE_HOMEBREW_PYTHON.md** | Migration depuis Homebrew | Vous avez l'erreur "externally-managed-environment" |
| **PYTHON_VENV_GUIDE.md** | Guide environnements virtuels | Vous voulez les meilleures pratiques |
| **setup-mac.sh** | Script d'installation auto | Installation nouvelle Python |
| **migrate-from-homebrew.sh** | Script de migration auto | Migration depuis Homebrew |

---

## 🚀 Scénarios d'utilisation

### Scénario 1 : Débutant sur Mac M4

```bash
# 1. Lire le guide rapide
cat QUICKSTART_MAC.md

# 2. Exécuter le script d'installation
chmod +x setup-mac.sh
./setup-mac.sh

# 3. Vérifier
python3 --version
pip3 --version
```

### Scénario 2 : Erreur avec Homebrew (solution simple)

```bash
# 1. Lire le guide de migration
cat REMOVE_HOMEBREW_PYTHON.md

# 2. Exécuter la migration
chmod +x migrate-from-homebrew.sh
./migrate-from-homebrew.sh

# 3. Tester
pip3 install --upgrade pip  # Devrait fonctionner !
```

### Scénario 3 : Erreur avec Homebrew (solution pro)

```bash
# 1. Lire le guide venv
cat PYTHON_VENV_GUIDE.md

# 2. Créer un environnement virtuel
python3 -m venv venv
source venv/bin/activate

# 3. Utiliser pip
pip install --upgrade pip  # Fonctionne dans venv !
```

### Scénario 4 : Projet existant avec requirements.txt

```bash
# 1. Créer l'environnement
python3 -m venv venv
source venv/bin/activate

# 2. Installer les dépendances
pip install -r requirements.txt

# 3. Travailler sur le projet
python app.py
```

---

## ❓ Questions Fréquentes

### Dois-je désinstaller Homebrew complètement ?

**Non !** Vous pouvez garder Homebrew pour d'autres outils. Désinstallez juste Python :

```bash
brew uninstall python@3.11 python@3.12
```

### Puis-je avoir Python de Homebrew ET python.org ?

**Oui**, mais attention aux conflits. Configurez bien votre PATH pour prioriser la version python.org :

```bash
export PATH="/Library/Frameworks/Python.framework/Versions/3.12/bin:$PATH"
```

### Quelle est la meilleure solution ?

**Ça dépend de votre usage :**

- **Usage personnel, scripts simples** → Migration depuis Homebrew (plus simple)
- **Projets professionnels, travail en équipe** → Environnements virtuels (meilleures pratiques)
- **Les deux** → Migration + venv quand nécessaire (flexibilité maximale)

### Est-ce que zip est toujours disponible ?

**Oui**, `zip` est préinstallé sur macOS et ne nécessite aucune configuration. Il fonctionne toujours :

```bash
zip -r archive.zip dossier/
```

### Je veux revenir à Homebrew, comment faire ?

```bash
# Réinstaller Python via Homebrew
brew install python@3.12

# Supprimer l'installation python.org (optionnel)
sudo rm -rf /Library/Frameworks/Python.framework
```

---

## 🎓 Apprendre plus

### Tutoriels et ressources

- [Documentation Python officielle](https://docs.python.org/3/)
- [Guide pip officiel](https://pip.pypa.io/en/stable/)
- [PEP 668 - Externally Managed Environments](https://peps.python.org/pep-0668/)

### Commandes essentielles

```bash
# Vérification
python3 --version
pip3 --version
which python3

# Installation de packages
pip3 install package_name
pip3 install --user package_name  # Installation utilisateur

# Environnements virtuels
python3 -m venv venv              # Créer
source venv/bin/activate          # Activer
deactivate                        # Désactiver

# Gestion des dépendances
pip freeze > requirements.txt     # Sauvegarder
pip install -r requirements.txt   # Restaurer
```

---

## 💡 Recommandations

### Pour débuter

1. Lisez [QUICKSTART_MAC.md](QUICKSTART_MAC.md)
2. Exécutez `./setup-mac.sh`
3. Si vous avez des erreurs avec pip, lisez [REMOVE_HOMEBREW_PYTHON.md](REMOVE_HOMEBREW_PYTHON.md)

### Pour projets sérieux

1. Lisez [PYTHON_VENV_GUIDE.md](PYTHON_VENV_GUIDE.md)
2. Utilisez TOUJOURS des environnements virtuels
3. Créez un `requirements.txt` pour chaque projet
4. Ajoutez `venv/` à votre `.gitignore`

### Pour installation propre

1. Désinstallez Python de Homebrew avec `./migrate-from-homebrew.sh`
2. Utilisez l'installation python.org
3. Configurez votre PATH une fois pour toutes
4. Profitez de pip sans contraintes !

---

## 🆘 Besoin d'aide ?

1. **Consultez les guides** dans l'ordre : QUICKSTART → SETUP → REMOVE_HOMEBREW ou VENV
2. **Vérifiez votre installation** : `python3 --version && pip3 --version`
3. **Testez pip** : `pip3 install --upgrade pip`
4. **Si erreur persiste** : Choisissez entre migration Homebrew ou environnements virtuels

---

**Bon développement ! 🚀**
