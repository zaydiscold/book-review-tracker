#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/src/frontend"
BACKEND_DIR="$ROOT_DIR/src/backend"

log() {
  printf '\n[%s] %s\n' "$(date '+%H:%M:%S')" "$1"
}

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to run this script." >&2
  exit 1
fi

if [[ ! -d "$FRONTEND_DIR" || ! -f "$FRONTEND_DIR/package.json" ]]; then
  echo "Cannot find frontend package.json in $FRONTEND_DIR" >&2
  exit 1
fi

if [[ ! -d "$BACKEND_DIR" || ! -f "$BACKEND_DIR/package.json" ]]; then
  echo "Cannot find backend package.json in $BACKEND_DIR" >&2
  exit 1
fi

pids=()
should_restart=0

stop_servers() {
  if ((${#pids[@]} == 0)); then
    return
  fi

  log "Stopping dev servers..."
  for pid in "${pids[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
      wait "$pid" 2>/dev/null || true
    fi
  done
  pids=()
}

handle_interrupt() {
  should_restart=1
  stop_servers
}

trap handle_interrupt INT
trap stop_servers EXIT

start_servers() {
  pids=()

  log "Starting frontend (npm run dev)"
  (
    cd "$FRONTEND_DIR"
    npm run dev
  ) &
  pids+=($!)

  log "Starting backend (npm start)"
  (
    cd "$BACKEND_DIR"
    npm start
  ) &
  pids+=($!)
}

wait_for_servers() {
  local remaining=()
  remaining=("${pids[@]}")

  while ((${#remaining[@]} > 0)); do
    local current="${remaining[0]}"
    remaining=("${remaining[@]:1}")
    wait "$current" 2>/dev/null || true
  done
}

while true; do
  start_servers
  wait_for_servers

  if ((should_restart)); then
    should_restart=0
    if [[ -t 0 ]]; then
      printf '\nServers stopped. Press Enter to restart, or press Ctrl+C again to exit. '
      if read -r; then
        log "Restarting dev servers..."
        continue
      fi
    fi
  fi

  break
done
