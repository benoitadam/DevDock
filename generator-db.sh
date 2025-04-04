get_env() {
    grep "^$1=" .env | cut -d '=' -f 2-
}

POSTGRES_PASSWORD=$(get_env POSTGRES_PASSWORD)
POSTGRES_URI="postgres://supabase_admin:${POSTGRES_PASSWORD}@supabase-db:5432/postgres"

echo $POSTGRES_URI