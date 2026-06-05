#!/usr/bin/env bash
set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────────────
IMAGE_NAME="chatia"
CONTAINER_NAME="chatia"
DEFAULT_PORT=8080

# Optional port override: ./run.sh --port 9090  or  ./run.sh -p 9090
PORT=${DEFAULT_PORT}
while [[ $# -gt 0 ]]; do
  case $1 in
    --port|-p) PORT="$2"; shift 2 ;;
    *) echo "Usage: $0 [--port PORT]"; exit 1 ;;
  esac
done

echo "========================================="
echo "  ChatIA — Local Docker Runner"
echo "  Port: ${PORT}"
echo "========================================="

# ── 1. Port cleanup — runs immediately on start ────────────────────────────────
echo ""
echo "🔍  Checking port ${PORT}..."

# Prefer lsof; fall back to ss (always available on Linux)
_port_pids() {
  if command -v lsof &>/dev/null; then
    lsof -ti:"${PORT}" 2>/dev/null || true
  else
    ss -tlnp "sport = :${PORT}" 2>/dev/null \
      | awk 'NR>1 {match($NF,/pid=([0-9]+)/,a); if(a[1]) print a[1]}' || true
  fi
}

PIDS=$(_port_pids)
if [[ -n "${PIDS}" ]]; then
  echo "⚠️   Port ${PORT} is in use by PID(s): ${PIDS}"
  echo "🔪  Killing process(es) on port ${PORT}..."
  echo "${PIDS}" | xargs kill -9 2>/dev/null || true
  sleep 1
  PIDS_AFTER=$(_port_pids)
  if [[ -n "${PIDS_AFTER}" ]]; then
    echo "❌  Could not free port ${PORT} (PID(s) still running: ${PIDS_AFTER})."
    echo "    Try: sudo kill -9 ${PIDS_AFTER}"
    exit 1
  fi
  echo "✅  Port ${PORT} freed."
else
  echo "✅  Port ${PORT} is free."
fi

# ── 2. Check Docker is installed and running ───────────────────────────────────
echo ""
if ! command -v docker &>/dev/null; then
  echo "❌  Docker not found."
  echo "    Install it at: https://docs.docker.com/get-docker/"
  exit 1
fi

if ! docker info &>/dev/null 2>&1; then
  echo "❌  Docker daemon is not running."
  echo "    Start Docker and retry."
  exit 1
fi

# ── 3. Stop and remove any existing container with the same name ───────────────
echo ""
echo "🧹  Cleaning up existing '${CONTAINER_NAME}' container (if any)..."
docker stop "${CONTAINER_NAME}" 2>/dev/null && echo "    Stopped." || true
docker rm   "${CONTAINER_NAME}" 2>/dev/null && echo "    Removed." || true

# ── 4. Build Docker image ──────────────────────────────────────────────────────
echo ""
echo "🔨  Building Docker image '${IMAGE_NAME}:latest'..."
docker build -t "${IMAGE_NAME}" .
echo "✅  Image built."

# ── 5. Run container in detached mode ─────────────────────────────────────────
echo ""
echo "🚀  Starting container '${CONTAINER_NAME}' on port ${PORT}..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  -p "${PORT}:80" \
  --restart unless-stopped \
  "${IMAGE_NAME}"

# ── 6. Confirm container is running and print access info ─────────────────────
sleep 1
if docker ps --filter "name=^${CONTAINER_NAME}$" --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo ""
  echo "========================================="
  echo "  ✅  ChatIA is running!"
  echo ""
  echo "  🌐  http://localhost:${PORT}            ← Landing page"
  echo "  💬  http://localhost:${PORT}/index.html ← Chat"
  echo "  🎮  http://localhost:${PORT}/games.html ← Mini-Jeux"
  echo ""
  echo "  📄  Logs : docker logs -f ${CONTAINER_NAME}"
  echo "  🛑  Stop  : docker stop ${CONTAINER_NAME}"
  echo "========================================="
else
  echo ""
  echo "❌  Container failed to start. Last logs:"
  docker logs "${CONTAINER_NAME}" 2>&1 || true
  exit 1
fi
