#!/bin/bash

# Actualizar Homebrew
brew update

# Instalar MongoDB
brew tap mongodb/brew
brew install mongodb-community@5.0

# Iniciar MongoDB
brew services start mongodb/brew/mongodb-community

echo "MongoDB ha sido instalado y está corriendo."