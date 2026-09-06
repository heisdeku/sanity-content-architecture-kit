#!/usr/bin/env sh
# Extracts the schema (required fields enforced) and generates
# sanity/sanity.types.ts. Works without a real project: placeholder ids are
# used when the env is empty, because the config only needs them to exist.
set -eu
cd "$(dirname "$0")/.."

# Read .env line by line instead of sourcing it: values such as
# `Name <mail@example.com>` are not valid shell and would abort the script.
if [ -f .env ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in ''|'#'*) continue ;; esac
    key="${line%%=*}"
    value="${line#*=}"
    case "$key" in *[!A-Za-z0-9_]*|'') continue ;; esac
    export "$key=$value"
  done < .env
fi

export NEXT_PUBLIC_SANITY_PROJECT_ID="${NEXT_PUBLIC_SANITY_PROJECT_ID:-${PUBLIC_SANITY_PROJECT_ID:-${SANITY_STUDIO_PROJECT_ID:-abcd1234}}}"
export NEXT_PUBLIC_SANITY_DATASET="${NEXT_PUBLIC_SANITY_DATASET:-${PUBLIC_SANITY_DATASET:-${SANITY_STUDIO_DATASET:-production}}}"
export SANITY_STUDIO_PROJECT_ID="$NEXT_PUBLIC_SANITY_PROJECT_ID"
export SANITY_STUDIO_DATASET="$NEXT_PUBLIC_SANITY_DATASET"

npx sanity schema extract --enforce-required-fields --force --path ./sanity-schema.json
npx sanity typegen generate
