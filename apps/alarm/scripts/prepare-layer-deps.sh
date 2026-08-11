#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
ALARM_DIR="$ROOT_DIR/apps/alarm"
BUILD_DIR="$ALARM_DIR/build"
LAYER_DIR="$BUILD_DIR/nodejs"
LAYER_NODE_MODULES_DIR="$LAYER_DIR/node_modules"
TEMP_DEPS_DIR="$BUILD_DIR/layer-deps"
TEMP_NPM_CACHE_DIR="$BUILD_DIR/.npm-cache"

rm -rf "$LAYER_DIR" "$TEMP_DEPS_DIR" "$TEMP_NPM_CACHE_DIR"
mkdir -p "$LAYER_NODE_MODULES_DIR" "$TEMP_DEPS_DIR" "$TEMP_NPM_CACHE_DIR"

cat > "$TEMP_DEPS_DIR/package.json" <<'EOF'
{
  "name": "alarm-layer-deps",
  "private": true,
  "version": "1.0.0",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.734.0",
    "@aws-sdk/client-scheduler": "^3.734.0",
    "@aws-sdk/client-sqs": "^3.734.0",
    "@aws-sdk/lib-dynamodb": "^3.734.0",
    "@msgpack/msgpack": "^3.1.3",
    "firebase-admin": "^12.0.0",
    "moment-timezone": "^0.6.0",
    "source-map-support": "^0.5.21"
  }
}
EOF

npm install --omit=dev --no-audit --no-fund --cache "$TEMP_NPM_CACHE_DIR" --prefix "$TEMP_DEPS_DIR"
rsync -a --delete "$TEMP_DEPS_DIR/node_modules/" "$LAYER_NODE_MODULES_DIR/"

mkdir -p "$LAYER_NODE_MODULES_DIR/alarm-core" "$LAYER_NODE_MODULES_DIR/trash-common"

cp "$ROOT_DIR/packages/alarm/core/package.json" "$LAYER_NODE_MODULES_DIR/alarm-core/package.json"
rsync -a --delete "$ROOT_DIR/packages/alarm/core/dist/" "$LAYER_NODE_MODULES_DIR/alarm-core/dist/"

cp "$ROOT_DIR/packages/trash-common/package.json" "$LAYER_NODE_MODULES_DIR/trash-common/package.json"
rsync -a --delete "$ROOT_DIR/packages/trash-common/dist/" "$LAYER_NODE_MODULES_DIR/trash-common/dist/"

# レイヤーサイズを抑えるために不要ファイルを削除する
find "$LAYER_NODE_MODULES_DIR" -type d \( -name test -o -name tests -o -name __tests__ -o -name docs -o -name doc \) -prune -exec rm -rf {} +
find "$LAYER_NODE_MODULES_DIR" -type f \( -name "*.md" -o -name "*.map" -o -name "LICENSE*" -o -name "CHANGELOG*" \) -delete

rm -rf "$TEMP_DEPS_DIR" "$TEMP_NPM_CACHE_DIR"
