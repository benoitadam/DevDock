#!/bin/bash
set -e # Arrêter le script à la première erreur

get_env() {
    grep "^$1=" ../.env | cut -d '=' -f 2-
}

replace_env() {
    local name=$1

    # Échapper les caractères spéciaux pour sed
    local value=$(echo "$2" | sed -e 's/[\/&]/\\&/g')

    # Remplacer {NAME} par sa valeur dans le fichier
    sed -i "s/$name/$value/g" _generated/Caddyfile
}

ADMIN_USERNAME=$(get_env ADMIN_USERNAME)
ADMIN_PASSWORD=$(get_env ADMIN_PASSWORD)
ADMIN_PASSWORD_HASHED=$(echo "$ADMIN_PASSWORD" | docker run --rm -i caddy:2 caddy hash-password)

mkdir -p _generated

cp Caddyfile _generated/Caddyfile
replace_env {ADMIN_USERNAME} $ADMIN_USERNAME
replace_env {ADMIN_PASSWORD_HASHED} $ADMIN_PASSWORD_HASHED

# Démarrer les services Docker Compose
docker compose --env-file ../.env up -d --build --remove-orphans

# Valider le fichier de configuration Caddy
docker cp _generated/Caddyfile caddy:/etc/caddy/CaddyfileTest
docker exec caddy caddy validate --config /etc/caddy/CaddyfileTest

# Recharger la configuration Caddy
docker cp _generated/Caddyfile caddy:/etc/caddy/Caddyfile
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
