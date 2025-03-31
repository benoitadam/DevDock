#!/bin/bash
set -e # Arrêter le script à la première erreur

sudo apt update -y
sudo apt upgrade -y
sudo apt dist-upgrade -y

# Allow read write sql
sudo chmod -R 777 ./workspace/sql

chmod +x ./budibase/up.sh
chmod +x ./caddy/up.sh
chmod +x ./code/up.sh
chmod +x ./n8n/up.sh
chmod +x ./supabase/up.sh

cd ./budibase && ./up.sh && cd ../
cd ./caddy && ./up.sh && cd ../
cd ./code && ./up.sh && cd ../
cd ./n8n && ./up.sh && cd ../
cd ./supabase && ./up.sh && cd ../