#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BINARY="${SCRIPT_DIR}/rust_backend"
LOG_DIR="${SCRIPT_DIR}/logs"
LOG_FILE="${LOG_DIR}/rust_backend.log"
PID_FILE="${SCRIPT_DIR}/rust_backend.pid"

if [[ ! -x "${BINARY}" ]]; then
  echo "错误: 未找到可执行文件 ${BINARY}"
  exit 1
fi

mkdir -p "${LOG_DIR}"

nohup "${BINARY}" >"${LOG_FILE}" 2>&1 &
echo $! >"${PID_FILE}"

echo "rust_backend 已后台启动"
echo "PID: $(cat "${PID_FILE}")"
echo "日志: ${LOG_FILE}"