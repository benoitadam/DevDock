#!/bin/bash
set -e # Arrêter le script à la première erreur

# Démarrer les services Docker Compose
docker compose --env-file ../.env up -d --build

# Formater le fichier de configuration Caddy
docker exec caddy caddy fmt --overwrite --config /etc/caddy/Caddyfile

# Valider le fichier de configuration Caddy
docker exec caddy caddy validate --config /etc/caddy/Caddyfile

# Recharger la configuration Caddy
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
