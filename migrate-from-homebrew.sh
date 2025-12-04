#!/bin/bash

# Script de migration Python : Homebrew -> Python.org
# Migration vers installation native sans contraintes

set -e  # Arrêter en cas d'erreur

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${CYAN}================================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}================================================${NC}"
    echo ""
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_step() {
    echo ""
    echo -e "${CYAN}📌 $1${NC}"
    echo "---"
}

# Vérifier si l'utilisateur veut continuer
confirm() {
    read -p "$(echo -e ${YELLOW}"$1 (o/n) : "${NC})" -n 1 -r
    echo
    [[ $REPLY =~ ^[OoYy]$ ]]
}

print_header "🔄 Migration Python : Homebrew → Python.org"
echo "Ce script va :"
echo "  1. Détecter votre installation Python actuelle"
echo "  2. Sauvegarder vos packages installés"
echo "  3. Désinstaller Python de Homebrew"
echo "  4. Vous guider pour installer Python depuis python.org"
echo "  5. Configurer votre système"
echo ""
print_warning "Ce script nécessitera votre mot de passe administrateur"
echo ""

if ! confirm "Voulez-vous continuer ?"; then
    print_info "Migration annulée"
    exit 0
fi

# Étape 1 : Détection
print_step "Étape 1/6 : Détection de l'installation actuelle"

if ! command -v python3 &> /dev/null; then
    print_warning "Python3 n'est pas installé"
    print_info "Passez directement à l'installation depuis python.org"
    print_info "Visitez : https://www.python.org/downloads/"
    exit 0
fi

PYTHON_PATH=$(which python3)
PYTHON_VERSION=$(python3 --version)
PYTHON_PREFIX=$(python3 -c "import sys; print(sys.prefix)")

print_info "Python trouvé : $PYTHON_VERSION"
print_info "Emplacement : $PYTHON_PATH"
print_info "Prefix : $PYTHON_PREFIX"

# Vérifier si c'est Homebrew
IS_HOMEBREW=false
if [[ "$PYTHON_PREFIX" == *"homebrew"* ]] || [[ "$PYTHON_PREFIX" == *"Cellar"* ]] || [[ "$PYTHON_PATH" == *"homebrew"* ]]; then
    IS_HOMEBREW=true
    print_warning "Python est géré par Homebrew"
else
    print_success "Python n'est PAS géré par Homebrew"
    print_info "Votre installation est déjà correcte !"

    # Tester pip
    echo ""
    print_info "Test de pip..."
    if pip3 install --upgrade pip &> /dev/null; then
        print_success "pip fonctionne parfaitement ! Aucune migration nécessaire."
        exit 0
    else
        print_warning "pip semble avoir des problèmes. Continuons la migration."
    fi
fi

if ! $IS_HOMEBREW; then
    print_error "Ce script est conçu pour migrer depuis Homebrew"
    exit 1
fi

# Étape 2 : Sauvegarde des packages
print_step "Étape 2/6 : Sauvegarde des packages installés"

BACKUP_FILE="$HOME/python_packages_backup_$(date +%Y%m%d_%H%M%S).txt"

if command -v pip3 &> /dev/null; then
    print_info "Sauvegarde de vos packages Python..."
    pip3 list --format=freeze > "$BACKUP_FILE" 2>/dev/null || true

    if [ -s "$BACKUP_FILE" ]; then
        PACKAGE_COUNT=$(wc -l < "$BACKUP_FILE")
        print_success "Sauvegarde créée : $BACKUP_FILE ($PACKAGE_COUNT packages)"

        echo ""
        print_info "Aperçu des packages sauvegardés :"
        head -10 "$BACKUP_FILE" | while read line; do
            echo "  - $line"
        done
        if [ $PACKAGE_COUNT -gt 10 ]; then
            echo "  ... et $((PACKAGE_COUNT - 10)) autres"
        fi
    else
        print_info "Aucun package à sauvegarder"
    fi
else
    print_warning "pip3 non trouvé, impossible de sauvegarder les packages"
fi

# Étape 3 : Désinstallation de Homebrew Python
print_step "Étape 3/6 : Désinstallation de Python Homebrew"

if ! command -v brew &> /dev/null; then
    print_warning "Homebrew n'est pas installé"
else
    # Lister les versions Python installées
    print_info "Recherche des versions Python installées par Homebrew..."
    PYTHON_FORMULAE=$(brew list 2>/dev/null | grep python || true)

    if [ -z "$PYTHON_FORMULAE" ]; then
        print_info "Aucune formule Python trouvée dans Homebrew"
    else
        echo ""
        print_info "Formules Python trouvées :"
        echo "$PYTHON_FORMULAE" | while read formula; do
            echo "  - $formula"
        done

        echo ""
        if confirm "Désinstaller ces versions Python de Homebrew ?"; then
            echo "$PYTHON_FORMULAE" | while read formula; do
                print_info "Désinstallation de $formula..."
                brew uninstall --ignore-dependencies "$formula" 2>/dev/null || true
                print_success "$formula désinstallé"
            done

            # Nettoyage
            print_info "Nettoyage de Homebrew..."
            brew cleanup 2>/dev/null || true
            print_success "Nettoyage terminé"
        else
            print_warning "Désinstallation ignorée"
        fi
    fi
fi

# Nettoyer les liens symboliques
print_info "Nettoyage des liens symboliques..."
sudo rm -f /usr/local/bin/python3* 2>/dev/null || true
sudo rm -f /usr/local/bin/pip3* 2>/dev/null || true
print_success "Liens nettoyés"

# Étape 4 : Téléchargement et installation
print_step "Étape 4/6 : Installation de Python depuis python.org"

print_info "Options d'installation :"
echo ""
echo "Option A : Téléchargement manuel (RECOMMANDÉ)"
echo "  1. Ouvrez https://www.python.org/downloads/ dans votre navigateur"
echo "  2. Téléchargez 'macOS 64-bit universal2 installer'"
echo "  3. Ouvrez le fichier .pkg téléchargé"
echo "  4. Suivez l'assistant d'installation"
echo ""
echo "Option B : Téléchargement automatique (nécessite curl)"
echo "  Le script va télécharger et installer Python 3.12.7"
echo ""

if confirm "Voulez-vous télécharger automatiquement Python 3.12.7 ?"; then
    PYTHON_VERSION="3.12.7"
    PKG_NAME="python-${PYTHON_VERSION}-macos11.pkg"
    DOWNLOAD_URL="https://www.python.org/ftp/python/${PYTHON_VERSION}/${PKG_NAME}"

    print_info "Téléchargement de Python ${PYTHON_VERSION}..."
    cd ~/Downloads

    if curl -L -O "$DOWNLOAD_URL"; then
        print_success "Téléchargement terminé : ~/Downloads/${PKG_NAME}"

        echo ""
        print_info "Installation de Python ${PYTHON_VERSION}..."
        print_warning "Vous devrez entrer votre mot de passe administrateur"

        if sudo installer -pkg "$PKG_NAME" -target /; then
            print_success "Python ${PYTHON_VERSION} installé avec succès !"
        else
            print_error "Erreur lors de l'installation"
            print_info "Installez manuellement : ~/Downloads/${PKG_NAME}"
            exit 1
        fi
    else
        print_error "Erreur lors du téléchargement"
        print_info "Installez manuellement depuis : https://www.python.org/downloads/"
        exit 1
    fi
else
    print_info "Installation manuelle"
    echo ""
    print_info "📋 Instructions :"
    echo "  1. Ouvrez : https://www.python.org/downloads/"
    echo "  2. Téléchargez la dernière version (macOS 64-bit universal2)"
    echo "  3. Ouvrez le fichier .pkg et suivez l'installation"
    echo "  4. Relancez ce script après l'installation"
    echo ""
    read -p "Appuyez sur Entrée quand Python est installé..."
fi

# Étape 5 : Configuration du PATH
print_step "Étape 5/6 : Configuration du PATH"

# Détecter le shell
if [[ "$SHELL" == *"zsh"* ]]; then
    SHELL_CONFIG="$HOME/.zshrc"
    SHELL_NAME="zsh"
elif [[ "$SHELL" == *"bash"* ]]; then
    SHELL_CONFIG="$HOME/.bash_profile"
    SHELL_NAME="bash"
else
    SHELL_CONFIG="$HOME/.zshrc"
    SHELL_NAME="zsh"
fi

print_info "Shell détecté : $SHELL_NAME"
print_info "Fichier de configuration : $SHELL_CONFIG"

# Trouver la version installée
PYTHON_FRAMEWORK="/Library/Frameworks/Python.framework/Versions"
if [ -d "$PYTHON_FRAMEWORK" ]; then
    LATEST_VERSION=$(ls -t "$PYTHON_FRAMEWORK" | grep -E "^3\." | head -1)

    if [ -n "$LATEST_VERSION" ]; then
        print_success "Python $LATEST_VERSION détecté"

        # Vérifier si la configuration existe déjà
        if grep -q "Python.framework" "$SHELL_CONFIG" 2>/dev/null; then
            print_info "Configuration PATH déjà présente"
        else
            print_info "Ajout de Python au PATH..."

            # Sauvegarder le fichier actuel
            if [ -f "$SHELL_CONFIG" ]; then
                cp "$SHELL_CONFIG" "${SHELL_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
            fi

            # Ajouter la configuration
            cat >> "$SHELL_CONFIG" << EOF

# Python Configuration (python.org installation)
export PATH="/Library/Frameworks/Python.framework/Versions/${LATEST_VERSION}/bin:\$PATH"
export PATH="/usr/local/bin:\$PATH"

# Alias pratiques
alias python=python3
alias pip=pip3

EOF
            print_success "Configuration ajoutée à $SHELL_CONFIG"
        fi

        # Recharger la configuration
        source "$SHELL_CONFIG" 2>/dev/null || true

        # Créer des liens symboliques si nécessaire
        if [ ! -L "/usr/local/bin/python3" ]; then
            print_info "Création des liens symboliques..."
            sudo ln -sf "$PYTHON_FRAMEWORK/${LATEST_VERSION}/bin/python3" /usr/local/bin/python3 2>/dev/null || true
            sudo ln -sf "$PYTHON_FRAMEWORK/${LATEST_VERSION}/bin/pip3" /usr/local/bin/pip3 2>/dev/null || true
            print_success "Liens créés"
        fi
    fi
fi

# Étape 6 : Vérification
print_step "Étape 6/6 : Vérification et tests"

# Recharger le PATH
export PATH="/Library/Frameworks/Python.framework/Versions/${LATEST_VERSION}/bin:/usr/local/bin:$PATH"

sleep 2

if command -v python3 &> /dev/null; then
    NEW_PYTHON_PATH=$(which python3)
    NEW_PYTHON_VERSION=$(python3 --version)
    NEW_PYTHON_PREFIX=$(python3 -c "import sys; print(sys.prefix)")

    print_success "Python installé : $NEW_PYTHON_VERSION"
    print_info "Emplacement : $NEW_PYTHON_PATH"
    print_info "Prefix : $NEW_PYTHON_PREFIX"

    # Vérifier que ce n'est pas Homebrew
    if [[ "$NEW_PYTHON_PREFIX" == *"homebrew"* ]] || [[ "$NEW_PYTHON_PREFIX" == *"Cellar"* ]]; then
        print_error "ATTENTION : Python semble toujours géré par Homebrew"
        print_info "Ouvrez un nouveau terminal et relancez ce script"
        exit 1
    else
        print_success "Python n'est plus géré par Homebrew ✓"
    fi

    # Tester pip
    echo ""
    print_info "Test de pip..."

    if python3 -m pip --version &> /dev/null; then
        print_success "pip fonctionne"

        # Test d'installation
        print_info "Test d'installation d'un package..."
        if python3 -m pip install --upgrade pip &> /dev/null; then
            print_success "pip install fonctionne SANS erreur ! 🎉"
            print_success "Plus d'erreur 'externally-managed-environment' !"
        else
            print_warning "pip install a rencontré un problème"
            print_info "Essayez : pip3 install --user --upgrade pip"
        fi
    else
        print_warning "pip non trouvé, installation..."
        python3 -m ensurepip --upgrade
    fi

    # Proposer de réinstaller les packages
    echo ""
    if [ -s "$BACKUP_FILE" ]; then
        print_info "Fichier de sauvegarde trouvé : $BACKUP_FILE"

        if confirm "Voulez-vous réinstaller vos anciens packages ?"; then
            print_info "Réinstallation des packages..."
            python3 -m pip install -r "$BACKUP_FILE" 2>&1 | grep -E "(Successfully|Requirement already|ERROR)" || true
            print_success "Packages réinstallés"
        fi
    fi
else
    print_error "Python n'est pas trouvé"
    print_info "Ouvrez un nouveau terminal et tapez : which python3"
fi

# Résumé final
print_header "✨ Migration terminée !"

echo -e "${GREEN}Prochaines étapes :${NC}"
echo "  1. Ouvrez un NOUVEAU terminal"
echo "  2. Tapez : python3 --version"
echo "  3. Tapez : pip3 install --upgrade pip"
echo ""
echo -e "${GREEN}Si ça fonctionne sans erreur, vous avez réussi ! 🎉${NC}"
echo ""
echo -e "${CYAN}Commandes disponibles :${NC}"
echo "  python3 --version          # Voir la version Python"
echo "  pip3 --version             # Voir la version pip"
echo "  pip3 install package_name  # Installer un package"
echo "  pip3 list                  # Voir les packages installés"
echo ""
echo -e "${YELLOW}Documentation :${NC}"
echo "  Voir REMOVE_HOMEBREW_PYTHON.md pour plus de détails"
echo ""
print_info "Fichiers créés :"
echo "  - Configuration : $SHELL_CONFIG"
if [ -s "$BACKUP_FILE" ]; then
    echo "  - Sauvegarde packages : $BACKUP_FILE"
fi

echo ""
print_success "Vous pouvez maintenant utiliser pip sans environnement virtuel ! 🚀"
