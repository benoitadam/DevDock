#!/bin/bash
set -e # Arrêter le script à la première erreur

sudo chmod +x ./generator.sh
./generator.sh

cd _generated

docker compose up -d

cd ../