#!/usr/bin/env bash
# 合并 public / admin 两份 OpenAPI 文档，产出 server/openapi.json（给 Apifox 用）
#
# 用法：
#   ./scripts/export-openapi.sh                                     # 默认连本机 8081/8082
#   ./scripts/export-openapi.sh <public文档URL|本地json> <admin文档URL|本地json> [对外基地址]
#
# 两个参数都支持传本地文件，容器跑服务时用得上（compose 没把 8081/8082 映射到宿主）：
#   docker exec aimcc-blog-public-1 wget -qO- http://127.0.0.1:8081/api/v3/api-docs > /tmp/pub.json
#   docker exec aimcc-blog-admin-1  wget -qO- http://127.0.0.1:8082/api/admin/v3/api-docs > /tmp/adm.json
#   ./scripts/export-openapi.sh /tmp/pub.json /tmp/adm.json
#
# 前提：两个服务已启动（文档端点只有本机可达，不对外）
set -euo pipefail

PUBLIC_DOC="${1:-http://localhost:8081/api/v3/api-docs}"
ADMIN_DOC="${2:-http://localhost:8082/api/admin/v3/api-docs}"
# 对外基地址：文档里的 paths 不含 context-path，统一用网关的 /api 做前缀
SERVER_URL="${3:-http://localhost:8080/api}"

OUT="$(cd "$(dirname "$0")/.." && pwd)/openapi.json"
TMP_PUB="$(mktemp)"
TMP_ADM="$(mktemp)"
trap 'rm -f "$TMP_PUB" "$TMP_ADM"' EXIT

# 参数是 URL 就 curl，是本地文件就直接用
fetch() {
  local src="$1"
  local dst="$2"
  if [[ "$src" == http* ]]; then
    curl -fsS -m 15 "$src" -o "$dst"
  else
    cp "$src" "$dst"
  fi
}

fetch "$PUBLIC_DOC" "$TMP_PUB"
fetch "$ADMIN_DOC" "$TMP_ADM"

# 两个服务里的 schema 名字都带 ApiResult 前缀、目前无重名；真有重名会覆盖后者，合并前先看一眼
jq -s --arg serverUrl "$SERVER_URL" '
{
  openapi: "3.0.1",
  info: { title: "aimcc-blog API", version: "v1", description: "public + admin 合并文档，paths 相对网关 /api" },
  servers: [{ url: $serverUrl, description: "gateway" }],
  paths: (.[0].paths + .[1].paths),
  components: { schemas: ((.[0].components.schemas // {}) + (.[1].components.schemas // {})) },
  tags: []
}' "$TMP_PUB" "$TMP_ADM" > "$OUT"

echo "已写出 $OUT"
echo "paths: $(jq '.paths | length' "$OUT")，schemas: $(jq '.components.schemas | length' "$OUT")"
