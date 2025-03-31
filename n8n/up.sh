#!/bin/bash
set -e # Arrêter le script à la première erreur

# Allow n8n call docker-cli
sudo chmod 666 /var/run/docker.sock

docker compose --env-file ../.env up -d --build