#!/bin/bash
# 一键导入：将任意 .md 文件自动分类并部署到博客
#
# 用法:
#   bash scripts/ingest.sh <源文件.md> [分类路径]
#
# 示例:
#   bash scripts/ingest.sh "E:/work/Nightingale/docs/多平台电话告警方案调研与对比.md" "工作/电话告警/调研结果"
#   bash scripts/ingest.sh "E:/work/xxx.md"                           # 默认 → 工作/随笔
#
# 写完后自动: hexo generate → 复制到公开仓库 → 提交推送

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
POSTS_DIR="$PROJECT_DIR/source/_posts"
PUBLIC_REPO="/tmp/SHERRYxxng.github.io"
DEFAULT_CATEGORY="工作/随笔"

# --- 参数 ---
SRC="$1"
CATEGORY="${2:-$DEFAULT_CATEGORY}"

if [ -z "$SRC" ]; then
  echo "用法: bash scripts/ingest.sh <源文件.md> [分类路径]"
  echo "示例: bash scripts/ingest.sh 'E:/work/xxx.md' '工作/电话告警/调研结果'"
  exit 1
fi

if [ ! -f "$SRC" ]; then
  echo "错误: 文件不存在 — $SRC"
  exit 1
fi

# --- 提取文件名和标题 ---
FILENAME=$(basename "$SRC")
TITLE="${FILENAME%.md}"
TARGET_DIR="$POSTS_DIR/$CATEGORY"
TARGET_FILE="$TARGET_DIR/$FILENAME"

echo "============================================"
echo "  博客文件导入"
echo "============================================"
echo "  源文件:     $SRC"
echo "  分类路径:   $CATEGORY"
echo "  目标位置:   source/_posts/$CATEGORY/$FILENAME"
echo "============================================"

# --- 创建目标目录 ---
mkdir -p "$TARGET_DIR"

# --- 复制文件 ---
cp "$SRC" "$TARGET_FILE"

# --- 检查是否需要添加 front-matter ---
FIRST_LINE=$(head -1 "$TARGET_FILE")
if [ "$FIRST_LINE" != "---" ]; then
  echo "  → 添加 front-matter..."

  IFS='/' read -ra CAT_PARTS <<< "$CATEGORY"

  cat > "$TARGET_FILE.tmp" << EOFMETA
---
title: $TITLE
categories: ${CAT_PARTS[0]}
tags:
$(
  for tag in "${CAT_PARTS[@]}"; do
    [ "$tag" != "${CAT_PARTS[0]}" ] && echo "  - $tag"
  done
)
date: $(date +%Y-%m-%d)
---

$(cat "$TARGET_FILE")
EOFMETA

  mv "$TARGET_FILE.tmp" "$TARGET_FILE"
fi

# --- 生成静态文件 ---
echo "  → hexo generate..."
cd "$PROJECT_DIR"
npx hexo generate --silent 2>/dev/null

# --- 加密生活分类 ---
bash "$SCRIPT_DIR/protect.sh"

# --- 部署到公开仓库 ---
if [ ! -d "$PUBLIC_REPO/.git" ]; then
  echo "  → 克隆公开仓库..."
  git clone git@github.com:SHERRYxxng/SHERRYxxng.github.io.git "$PUBLIC_REPO" 2>/dev/null
fi

echo "  → 部署到公开仓库..."
cd "$PUBLIC_REPO"
find . -mindepth 1 -maxdepth 1 -not -name '.git' -exec rm -rf {} + 2>/dev/null || true
cp -r "$PROJECT_DIR/public/"* "$PUBLIC_REPO/" 2>/dev/null || true
cp -r "$PROJECT_DIR/public/.github" "$PUBLIC_REPO/" 2>/dev/null || true
touch "$PUBLIC_REPO/.nojekyll"

git add -A 2>/dev/null
if git diff --staged --quiet; then
  echo "  → 无变化，跳过部署"
else
  git commit -m "Auto deploy: $TITLE" --quiet 2>/dev/null
  git push origin main --quiet 2>/dev/null
  echo "  ✓ 部署完成！"
fi

# --- 同时提交到私人仓库 ---
echo "  → 提交到私人仓库..."
cd "$PROJECT_DIR"
git add "$TARGET_FILE" 2>/dev/null
git commit -m "Add post: $TITLE" --quiet 2>/dev/null || true
git push origin master --quiet 2>/dev/null || true

echo ""
echo "  ✓ 全部完成！"
echo "  https://sherryxxng.github.io"
