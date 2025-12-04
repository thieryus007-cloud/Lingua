#!/bin/bash

# Script de configuration Python, zip et pip pour Mac Mini M4
# Sans Homebrew - Configuration permanente

set -e  # Arrêter en cas d'erreur

echo "🚀 Configuration de Python, zip et pip pour Mac Mini M4"
echo "=================================================="
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
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

# Détecter le shell utilisé
detect_shell() {
    if [[ "$SHELL" == *"zsh"* ]]; then
        echo "zsh"
    elif [[ "$SHELL" == *"bash"* ]]; then
        echo "bash"
    else
        echo "unknown"
    fi
}

SHELL_TYPE=$(detect_shell)
print_info "Shell détecté : $SHELL_TYPE"

# Définir le fichier de configuration
if [ "$SHELL_TYPE" = "zsh" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [ "$SHELL_TYPE" = "bash" ]; then
    SHELL_CONFIG="$HOME/.bash_profile"
else
    print_warning "Shell non reconnu, utilisation de ~/.zshrc par défaut"
    SHELL_CONFIG="$HOME/.zshrc"
fi

echo ""
echo "📋 Étape 1/5 : Vérification des outils installés"
echo "------------------------------------------------"

# Vérifier Python3
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python trouvé : $PYTHON_VERSION"
    PYTHON_PATH=$(which python3)
    print_info "Emplacement : $PYTHON_PATH"
else
    print_error "Python3 n'est pas installé"
    echo ""
    print_info "Options d'installation :"
    echo "  1. Xcode Command Line Tools (recommandé) :"
    echo "     xcode-select --install"
    echo ""
    echo "  2. Python.org :"
    echo "     Téléchargez depuis https://www.python.org/downloads/"
    echo ""
    exit 1
fi

# Vérifier zip
if command -v zip &> /dev/null; then
    print_success "zip trouvé (préinstallé sur macOS)"
    ZIP_PATH=$(which zip)
    print_info "Emplacement : $ZIP_PATH"
else
    print_warning "zip n'est pas trouvé (inhabituel sur macOS)"
    print_info "Installez Xcode Command Line Tools : xcode-select --install"
fi

# Vérifier pip3
if command -v pip3 &> /dev/null; then
    PIP_VERSION=$(pip3 --version)
    print_success "pip trouvé : $PIP_VERSION"
else
    print_warning "pip3 n'est pas installé, tentative d'installation..."
    python3 -m ensurepip --upgrade
    if [ $? -eq 0 ]; then
        print_success "pip3 installé avec succès"
    else
        print_error "Impossible d'installer pip3"
    fi
fi

echo ""
echo "📝 Étape 2/5 : Sauvegarde de la configuration actuelle"
echo "------------------------------------------------------"

if [ -f "$SHELL_CONFIG" ]; then
    BACKUP_FILE="${SHELL_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$SHELL_CONFIG" "$BACKUP_FILE"
    print_success "Sauvegarde créée : $BACKUP_FILE"
else
    print_info "Création d'un nouveau fichier de configuration"
    touch "$SHELL_CONFIG"
fi

echo ""
echo "🔧 Étape 3/5 : Configuration du PATH"
echo "------------------------------------"

# Vérifier si la configuration existe déjà
if grep -q "# Python PATH Configuration" "$SHELL_CONFIG"; then
    print_warning "Configuration Python déjà présente dans $SHELL_CONFIG"
    print_info "Aucune modification nécessaire"
else
    # Ajouter la configuration
    cat >> "$SHELL_CONFIG" << 'EOF'

# Python PATH Configuration (ajouté par setup-mac.sh)
export PATH="/usr/local/bin:$PATH"
export PATH="/Library/Frameworks/Python.framework/Versions/Current/bin:$PATH"

# Alias pratiques pour Python et pip
alias python=python3
alias pip=pip3

EOF
    print_success "Configuration ajoutée à $SHELL_CONFIG"
fi

echo ""
echo "🔄 Étape 4/5 : Rechargement de la configuration"
echo "-----------------------------------------------"

# Recharger la configuration
source "$SHELL_CONFIG"
print_success "Configuration rechargée"

echo ""
echo "🎯 Étape 5/5 : Vérification finale"
echo "----------------------------------"

# Vérifications finales
ALL_GOOD=true

if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "python3 : $PYTHON_VERSION"
else
    print_error "python3 : Non trouvé"
    ALL_GOOD=false
fi

if command -v pip3 &> /dev/null; then
    PIP_VERSION=$(pip3 --version | awk '{print $2}')
    print_success "pip3 : version $PIP_VERSION"
else
    print_error "pip3 : Non trouvé"
    ALL_GOOD=false
fi

if command -v zip &> /dev/null; then
    print_success "zip : Disponible"
else
    print_error "zip : Non trouvé"
    ALL_GOOD=false
fi

echo ""
echo "=================================================="
if [ "$ALL_GOOD" = true ]; then
    print_success "Configuration terminée avec succès ! 🎉"
    echo ""
    print_info "Pour appliquer les changements dans votre terminal actuel :"
    echo "  source $SHELL_CONFIG"
    echo ""
    print_info "Les alias suivants sont maintenant disponibles :"
    echo "  python  → python3"
    echo "  pip     → pip3"
    echo ""
    print_info "Pour mettre à jour pip :"
    echo "  pip3 install --upgrade pip"
else
    print_warning "Configuration terminée avec des avertissements"
    echo ""
    print_info "Consultez SETUP_MAC.md pour plus d'informations"
fi

echo ""
print_info "Ouvrez un nouveau terminal pour que tous les changements prennent effet"
echo "=================================================="
