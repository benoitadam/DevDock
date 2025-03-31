get_env() {
    grep "^$1=" .env | cut -d '=' -f 2-
}

add_env() {
    if grep -q "^$1=" .env; then
        :
    else
        echo "add $1"
        echo "$1=$2" >> .env
    fi
}

rand_string() {
    cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w $1 | head -n 1
}

create_jwt() {
    ROLE=$1
    JWT_SECRET=$(get_env JWT_SECRET)
    PAYLOAD="{\"role\":\"$ROLE\",\"iss\":\"supabase\",\"iat\":$(date +%s),\"exp\":$(($(date +%s) + 100000000))}"
    B64_HEADER=$(echo -n '{"alg":"HS256","typ":"JWT"}' | openssl base64 -e -A | tr '+/' '-_' | tr -d '=')
    B64_PAYLOAD=$(echo -n "$PAYLOAD" | openssl base64 -e -A | tr '+/' '-_' | tr -d '=')
    SIGNATURE=$(echo -n "$B64_HEADER.$B64_PAYLOAD" | openssl dgst -sha256 -hmac "$JWT_SECRET" -binary | openssl base64 -e -A | tr '+/' '-_' | tr -d '=')
    echo "$B64_HEADER.$B64_PAYLOAD.$SIGNATURE"
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
    sudo rm -rf ./_generated/supabase
    mkdir -p ./_generated/supabase
    cp -r /tmp/supabase/docker/* ./_generated/supabase
    cp /tmp/supabase/docker/.env.example ./_generated/supabase/.env
}

generate_password() {
    echo "generate password"

    add_env ADMIN_PASSWORD $(rand_string 32)

    # supabase
    add_env POSTGRES_PASSWORD $(rand_string 32)
    add_env JWT_SECRET $(rand_string 40)
    add_env SECRET_KEY_BASE $(rand_string 64)
    add_env VAULT_ENC_KEY $(rand_string 40)
    add_env LOGFLARE_API_KEY $(rand_string 32)
    add_env LOGFLARE_LOGGER_BACKEND_API_KEY $(rand_string 32)
    add_env POOLER_TENANT_ID "tenant_$(rand_string 8)"
    add_env ANON_KEY $(create_jwt anon)
    add_env SERVICE_ROLE_KEY $(create_jwt service_role)
    add_env LOGFLARE_API_KEY $(rand_string 32)

    add_env BUDIBASE_JWT_SECRET $(rand_string 40)
    add_env BUDIBASE_MINIO_ACCESS_KEY $(rand_string 64)
    add_env BUDIBASE_MINIO_SECRET_KEY $(rand_string 64)
    add_env BUDIBASE_REDIS_PASSWORD $(rand_string 40)
    add_env BUDIBASE_COUCHDB_USER $(rand_string 10)
    add_env BUDIBASE_COUCHDB_PASSWORD $(rand_string 40)
    add_env BUDIBASE_INTERNAL_API_KEY $(rand_string 40)
}

generate_supabase_docker_compose() {
    echo "generate supabase './_generated/supabase/.docker-compose.yml'"

    OVERRIDE="./supabase-docker-compose.override.yml"
    RESULT="./_generated/supabase/docker-compose.yml"
    TMP="./_generated/supabase/docker-compose.tmp.yml"

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
    echo "generate supabase kong './_generated/supabase/.docker-compose.yml'"

    OVERRIDE="./supabase-kong.override.yml"
    RESULT="./_generated/supabase/volumes/api/kong.yml"
    TMP="./_generated/supabase/volumes/api/kong.tmp.yml"

    # yq eval-all 'select(fileIndex == 0) * select(fileIndex == 1)' $RESULT $OVERRIDE > $TMP

    # rm $RESULT
    # mv $TMP $RESULT
}

generate_supabase_env() {
    ENV_FILE=./_generated/supabase/.env
    echo "generate supabase '$ENV_FILE'"
    echo "" >> $ENV_FILE
    echo "# MY" >> $ENV_FILE
    merge_env $ENV_FILE .env
}

copy-to-ia-doc() {
    cp $1 _generated/ia-doc/$(echo $1 | sed 's|/|__|g')
}

generate_ia-doc() {
    mkdir -p _generated/ia-doc
    copy-to-ia-doc caddy/inject/inject.js
    copy-to-ia-doc caddy/Caddyfile
    copy-to-ia-doc caddy/docker-compose.yml
    copy-to-ia-doc caddy/Dockerfile
    copy-to-ia-doc code/docker-compose.yml
    copy-to-ia-doc code/install.sh
    copy-to-ia-doc n8n/docker-compose.yml
    copy-to-ia-doc n8n/Dockerfile
    copy-to-ia-doc pgadmin/docker-compose.yml
    copy-to-ia-doc pgadmin/servers.json
    copy-to-ia-doc workspace/sql/_02_create.sql
    copy-to-ia-doc workspace/sql/_03_updated_trigger.sql
    copy-to-ia-doc workspace/sql/_04_permissions.sql
    copy-to-ia-doc workspace/sql/_05_objects_to_assets.sql
    copy-to-ia-doc workspace/sql/_05_objects_to_assets.sql
    copy-to-ia-doc supabase-docker-compose.override.yml
    copy-to-ia-doc _generated/supabase/docker-compose.yml
    copy-to-ia-doc _generated/supabase/volumes/api/kong.yml
    copy-to-ia-doc generator.sh
    copy-to-ia-doc update.sh
}

install_yq

generate_password
generate_caddy_keycloak_user

get_supabase_source
copy_supabase_source_docker
generate_budibase_docker_compose
generate_supabase_docker_compose
generate_supabase_kong
generate_supabase_env

generate_ia-doc

# ##### docker-compose.yml #####

# echo "./_generated/.env"
# # Crée le fichier .env de supabase
# merge_env ./source/docker/.env.example ../.env ./_generated/.env

# # TODO smtp