#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/src/frontend"
BACKEND_DIR="$ROOT_DIR/src/backend"
PID_FILE="$ROOT_DIR/.start-dev.pids"

log() {
  printf '
[%s] %s
' "$(date '+%H:%M:%S')" "$1"
}

require_npm() {
  if ! command -v npm >/dev/null 2>&1; then
    echo "npm is required to run this script." >&2
    exit 1
  fi
}

validate_workspace() {
  if [[ ! -d "$FRONTEND_DIR" || ! -f "$FRONTEND_DIR/package.json" ]]; then
    echo "Cannot find frontend package.json in $FRONTEND_DIR" >&2
    exit 1
  fi

  if [[ ! -d "$BACKEND_DIR" || ! -f "$BACKEND_DIR/package.json" ]]; then
    echo "Cannot find backend package.json in $BACKEND_DIR" >&2
    exit 1
  fi
}

read_pid_file() {
  if [[ -f "$PID_FILE" ]]; then
    mapfile -t file_pids < "$PID_FILE"
    echo "${file_pids[@]}"
  fi
}

write_pid_file() {
  printf '%s
' "$@" >"$PID_FILE"
}

remove_pid_file() {
  rm -f "$PID_FILE"
}

pids_alive() {
  local pid
  for pid in "$@"; do
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      return 0
    fi
  done
  return 1
}

stop_servers() {
  local targets=()
  if (($# > 0)); then
    targets=("$@")
  else
    targets=($(read_pid_file || true))
  fi

  if (( ${#targets[@]} == 0 )); then
    echo "No running dev servers found."
    remove_pid_file
    return
  fi

  log "Stopping dev servers..."
  local pid
  for pid in "${targets[@]}"; do
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
      wait "$pid" 2>/dev/null || true
    fi
  done
  remove_pid_file
  log "Dev servers stopped."
}

start_servers() {
  require_npm
  validate_workspace

  local existing
  existing=($(read_pid_file || true))
  if (( ${#existing[@]} > 0 )) && pids_alive "${existing[@]}"; then
    echo "Dev servers already running (PIDs: ${existing[*]}). Use '$0 restart' or '$0 stop'."
    exit 0
  fi

  log "Starting frontend (npm run dev)"
  (
    cd "$FRONTEND_DIR"
    npm run dev
  ) &
  local frontend_pid=$!

  log "Starting backend (npm start)"
  (
    cd "$BACKEND_DIR"
    npm start
  ) &
  local backend_pid=$!

  write_pid_file "$frontend_pid" "$backend_pid"

  cleanup() {
    stop_servers "$frontend_pid" "$backend_pid"
  }
  trap cleanup EXIT
  trap 'stop_servers "$frontend_pid" "$backend_pid"; exit 130' INT

  wait "$frontend_pid" 2>/dev/null || true
  wait "$backend_pid" 2>/dev/null || true
}

status_servers() {
  local targets
  targets=($(read_pid_file || true))
  if (( ${#targets[@]} == 0 )); then
    echo "Dev servers are not running."
    return 1
  fi

  local alive=()
  local pid
  for pid in "${targets[@]}"; do
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      alive+=("$pid")
    fi
  done

  if (( ${#alive[@]} == 0 )); then
    echo "PID file found but no processes are running. Cleaning up stale state."
    remove_pid_file
    return 1
  fi

  echo "Dev servers running (PIDs: ${alive[*]})."
  return 0
}

restart_servers() {
  stop_servers
  start_servers
}

show_usage() {
  cat <<EOF
Usage: $0 [command]

Commands:
  start      Start the frontend and backend (default)
  stop       Stop running dev servers
  restart    Restart dev servers
  status     Show whether dev servers are running
EOF
}

command="${1:-start}"

case "$command" in
  start)
    start_servers
    ;;
  stop)
    stop_servers
    ;;
  restart)
    restart_servers
    ;;
  status)
    status_servers
    ;;
  --help|-h|help)
    show_usage
    ;;
  *)
    echo "Unknown command: $command" >&2
    show_usage >&2
    exit 1
    ;;
esac
