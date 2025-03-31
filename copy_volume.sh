#!/bin/bash

# Usage: ./copy_volume.sh volume_source volume_destination

from="$1"
to="$2"

if [ $# -ne 2 ]; then
    echo "Usage: ./copy_volume.sh volume_source volume_destination"
    exit 1
fi

if ! docker volume inspect "$from" &>/dev/null; then
    echo "Error: from '$from' no exists"
    exit 1
fi

if ! docker volume inspect "$to" &>/dev/null; then
    echo "Error: to '$to' no exists"
    exit 1
fi

echo "Copying data from '$from' to '$to'..."
docker container run --rm \
    -v "$from":/from \
    -v "$to":/to \
    alpine sh -c "cp -av /from/. /to/"

echo "copy ok"