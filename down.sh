#!/bin/bash
set -e # Arrêter le script à la première erreur

cd ./buidbase && ./down.sh && cd ../
cd ./caddy && ./down.sh && cd ../
cd ./code && ./down.sh && cd ../
cd ./n8n && ./down.sh && cd ../
cd ./supabase && ./down.sh && cd ../