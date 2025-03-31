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

    add_env BUDIBASE_JWT_SECRET $(rand_string 40)
    add_env BUDIBASE_MINIO_ACCESS_KEY $(rand_string 64)
    add_env BUDIBASE_MINIO_SECRET_KEY $(rand_string 64)
    add_env BUDIBASE_REDIS_PASSWORD $(rand_string 40)
    add_env BUDIBASE_COUCHDB_USER $(rand_string 10)
    add_env BUDIBASE_COUCHDB_PASSWORD $(rand_string 40)
    add_env BUDIBASE_INTERNAL_API_KEY $(rand_string 40)
}

generate_password