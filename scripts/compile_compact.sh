#!/usr/bin/env bash
# Copyright (C) Midnight Foundation
# SPDX-License-Identifier: Apache-2.0
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# compile_compact.sh — Authoritative Compact compiler invocation.
# Compiles Compact smart contracts into TypeScript bindings, ZK circuit keys,
# and ZKIR artifacts using the official Compact compiler.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "${SCRIPT_DIR}/package.json" ]]; then
  REPO_ROOT="${SCRIPT_DIR}"
else
  REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
fi

CLEAN=false
for arg in "$@"; do
  case "${arg}" in
    --clean)
      CLEAN=true
      ;;
    *)
      echo "Unknown argument: ${arg}" >&2
      exit 1
      ;;
  esac
done

# Detect Compact compiler (0.31.x preferred)
COMPACT_CMD=""
if [[ -x "/home/mehndi/.compact/versions/0.31.1/x86_64-unknown-linux-musl/compactc" ]]; then
  COMPACT_CMD="/home/mehndi/.compact/versions/0.31.1/x86_64-unknown-linux-musl/compactc"
elif command -v compact &>/dev/null; then
  COMPACT_CMD="compact"
elif command -v compactc &>/dev/null; then
  COMPACT_CMD="compactc"
fi

if [[ -z "${COMPACT_CMD}" ]]; then
  echo "ERROR: 'compact' / 'compactc' compiler not found on PATH." >&2
  echo "  Install it via setup-compact-action (0.31.1) or download from:" >&2
  echo "  https://docs.midnight.network/develop/tutorial/using/compact" >&2
  exit 1
fi

echo "Using Compact compiler: $("${COMPACT_CMD}" --version 2>&1 | head -n1)"

CONTRACTS=(
  "bboard:${REPO_ROOT}/contract/src/bboard.compact:${REPO_ROOT}/contract/src/managed/bboard"
  "private-vote:${REPO_ROOT}/contract/src/private-vote.compact:${REPO_ROOT}/contract/src/managed/private-vote"
)

for entry in "${CONTRACTS[@]}"; do
  IFS=":" read -r NAME SRC_PATH OUT_DIR <<< "${entry}"
  
  if [[ ! -f "${SRC_PATH}" ]]; then
    echo "Skipping ${NAME} (source not found at ${SRC_PATH})"
    continue
  fi

  if [[ "${CLEAN}" == "true" ]]; then
    echo "Cleaning: ${OUT_DIR}"
    rm -rf "${OUT_DIR}"
  fi

  mkdir -p "${OUT_DIR}"
  echo "Compiling ${NAME}: ${SRC_PATH} -> ${OUT_DIR}"
  
  # Standard 0.31.1 invocation: compact compile <source> <target>
  # (or compactc <source> <target> / compactc --skip-zk <source> <target> on systems without zkir AVX support)
  if "${COMPACT_CMD}" compile "${SRC_PATH}" "${OUT_DIR}" 2>/dev/null; then
    echo "  [OK] ${NAME} compiled successfully"
  elif "${COMPACT_CMD}" --skip-zk "${SRC_PATH}" "${OUT_DIR}" 2>/dev/null; then
    echo "  [OK] ${NAME} compiled successfully (--skip-zk)"
  elif "${COMPACT_CMD}" "${SRC_PATH}" "${OUT_DIR}" 2>/dev/null; then
    echo "  [OK] ${NAME} compiled successfully"
  else
    echo "Executing standard compile:"
    "${COMPACT_CMD}" compile "${SRC_PATH}" "${OUT_DIR}"
  fi
done

echo ""
echo "All Compact contracts compiled successfully."
