#!/bin/bash
set -e # Arrêter le script à la première erreur

cd _generated

docker compose down

cd ../