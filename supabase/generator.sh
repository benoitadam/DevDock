#!/bin/bash
set -e # Arrêter le script à la première erreur

get_env() {
    grep "^$1=" ../.env | cut -d '=' -f 2-
}

install_yq() {
    if ! command -v yq &> /dev/null; then
        echo "install yq"

        sudo apt-get update
        sudo apt-get install -y wget

        YQ_VERSION=$(wget -qO- https://api.github.com/repos/mikefarah/yq/releases/latest | grep tag_name | cut -d '"' -f 4)
        wget -q https://github.com/mikefarah/yq/releases/download/${YQ_VERSION}/yq_linux_amd64 -O /tmp/yq
        
        chmod +x /tmp/yq
        sudo mv /tmp/yq /usr/local/bin/yq
    fi
}

merge_env() {
  local base_file="$1"
  local override_file="$2"
  local output_file="${3:-$base_file}"
  local temp_file="$(mktemp)"
  
  # Copier le fichier de base
  cp "$base_file" "$temp_file"
  
  # Lire le fichier override ligne par ligne
  while IFS= read -r line || [ -n "$line" ]; do
    # Ignorer les commentaires et les lignes vides
    if [[ "$line" =~ ^[[:space:]]*$ || "$line" =~ ^[[:space:]]*# ]]; then
      continue
    fi
    
    # Extraire la clé (tout avant le premier =)
    key="${line%%=*}"
    value="${line#*=}"
    
    # Vérifier si la clé existe déjà
    if grep -q "^${key}=" "$temp_file"; then
      # Remplacer la valeur à sa position originale
      sed -i "s|^${key}=.*|${key}=${value}|" "$temp_file"
    else
      # Si la clé n'existe pas, l'ajouter à la fin
      echo "$line" >> "$temp_file"
    fi
  done < "$override_file"
  
  # Déplacer le fichier temporaire vers la destination
  mv "$temp_file" "$output_file"
}

get_supabase_source() {
    if [ ! -d "/tmp/supabase" ]; then
        echo "get supabase source..."
        git clone --depth 1 https://github.com/supabase/supabase
        mv supabase /tmp/supabase
    fi
}

copy_supabase_source_docker() {
    echo "copy supabase source docker"
    sudo rm -rf _generated
    mkdir -p _generated
    cp -r /tmp/supabase/docker/* _generated
    cp /tmp/supabase/docker/.env.example _generated/.env
}

generate_supabase_docker_compose() {
    echo "generate supabase '_generated/.docker-compose.yml'"

    OVERRIDE="./docker-compose.override.yml"
    RESULT="_generated/docker-compose.yml"
    TMP="_generated/docker-compose.tmp.yml"

    # Fusionner le fichier base avec le fichier override
    yq eval-all 'select(fileIndex == 0) * select(fileIndex == 1)' $RESULT $OVERRIDE > $TMP

    # Supprimer les propriétés qui sont nulles
    yq eval 'del(..|select(. == null))' $TMP > $RESULT

    # Change les volumes
    sed -i 's|./volumes/db/data:|db_data:|g' $RESULT
    sed -i 's|db-config:|db_config:|g' $RESULT

    rm $TMP
}

generate_supabase_kong() {
    echo "generate supabase kong '_generated/.docker-compose.yml'"

    OVERRIDE="./kong.override.yml"
    RESULT="_generated/volumes/api/kong.yml"
    TMP="_generated/volumes/api/kong.tmp.yml"

    # yq eval-all 'select(fileIndex == 0) * select(fileIndex == 1)' $RESULT $OVERRIDE > $TMP

    # rm $RESULT
    # mv $TMP $RESULT
}

generate_supabase_env() {
    ENV_FILE=_generated/.env
    echo "generate supabase '$ENV_FILE'"
    echo "" >> $ENV_FILE
    echo "# MY" >> $ENV_FILE
    merge_env $ENV_FILE ../.env
}

install_yq

get_supabase_source
copy_supabase_source_docker
generate_supabase_docker_compose
generate_supabase_kong
generate_supabase_env

# ##### docker-compose.yml #####

# echo "./_generated/.env"
# # Crée le fichier .env de supabase
# merge_env ./source/docker/.env.example ../.env ./_generated/.env

# # TODO smtp