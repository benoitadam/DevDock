copy() {
    cp $1 _generated/ia-doc/$(echo $1 | sed 's|/|__|g')
}

mkdir -p _generated/ia-doc

copy caddy/inject/inject.js
copy caddy/Caddyfile
copy caddy/docker-compose.yml
copy caddy/Dockerfile
copy code/docker-compose.yml
copy code/install.sh
copy n8n/docker-compose.yml
copy n8n/Dockerfile
copy pgadmin/docker-compose.yml
copy pgadmin/servers.json
copy workspace/sql/_02_create.sql
copy workspace/sql/_03_updated_trigger.sql
copy workspace/sql/_04_permissions.sql
copy workspace/sql/_05_objects_to_assets.sql
copy workspace/sql/_05_objects_to_assets.sql
copy supabase-docker-compose.override.yml
copy _generated/supabase/docker-compose.yml
copy _generated/supabase/volumes/api/kong.yml
copy generator.sh
copy update.sh