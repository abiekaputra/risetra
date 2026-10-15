#!/bin/zsh
set -e

SCRIPT_DIRECTORY="${0:A:h}"
WORKSPACE_DIRECTORY="${RISETRA_WORKSPACE:-${HOME}/Documents/Risetra Workspace}"
PORT="${RISETRA_PORT:-4173}"

cd "${SCRIPT_DIRECTORY}"

if ! command -v node >/dev/null 2>&1; then
  echo "Risetra requires Node.js 22 or newer."
  read -r "?Press Enter to close."
  exit 1
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "Install and sign in to Codex before starting Risetra."
  read -r "?Press Enter to close."
  exit 1
fi

if [[ ! -d node_modules ]]; then
  npm install
fi

if [[ ! -f dist/cli/index.js ]]; then
  npm run build
fi

if [[ ! -f "${WORKSPACE_DIRECTORY}/risetra.json" ]]; then
  node dist/cli/index.js init "${WORKSPACE_DIRECTORY}"
fi

node dist/cli/index.js serve "${WORKSPACE_DIRECTORY}" --port "${PORT}" &
SERVER_PID=$!
trap 'kill ${SERVER_PID} 2>/dev/null || true' EXIT INT TERM

for _ in {1..30}; do
  if curl --silent --fail "http://127.0.0.1:${PORT}/api/health" >/dev/null; then
    open "http://127.0.0.1:${PORT}"
    wait "${SERVER_PID}"
    exit $?
  fi
  sleep 0.2
done

echo "Risetra did not start. Review the message above."
wait "${SERVER_PID}"
