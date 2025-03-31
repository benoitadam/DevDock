#!/bin/bash
set -e # Arrêter le script à la première erreur

# chmod +x ./install.sh
sudo chown -R 1000:1000 ../workspace

docker compose --env-file ../.env up -d --build

docker restart code