#!/usr/bin/env bash
set -e

SOURCE_FILE="${1:-public/contract/private_vote.compact}"
OUTPUT_DIR="${2:-managed/private_vote}"

if [ ! -f "${SOURCE_FILE}" ]; then
  echo "Compact source file not found: ${SOURCE_FILE}" >&2
  exit 1
fi

if ! command -v compact >/dev/null 2>&1; then
  echo "Compact developer tools (compact) are required. No mock compilation will be reported as success." >&2
  exit 127
fi

mkdir -p "${OUTPUT_DIR}"
compact compile "${SOURCE_FILE}" "${OUTPUT_DIR}"
