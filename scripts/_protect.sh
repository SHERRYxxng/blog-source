#!/bin/bash
# 保护脚本：加密"生活"分类下的所有文章
# 账号: SHERRY  密码: 从 .passwd 读取
# 在 hexo generate 之后运行

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PASSWD_FILE="$PROJECT_DIR/.passwd"
POSTS_SRC="$PROJECT_DIR/source/_posts"
PUBLIC_POSTS="$PROJECT_DIR/public/posts"

if [ ! -f "$PASSWD_FILE" ]; then
  echo "[protect] 密码文件 .passwd 不存在，跳过"
  exit 0
fi

PASSWORD=$(cat "$PASSWD_FILE")

# 查找"生活"分类下的所有 .md 文件
LIFE_SRC="$POSTS_SRC/生活"
if [ ! -d "$LIFE_SRC" ]; then
  echo "[protect] source/_posts/生活/ 目录不存在，跳过"
  exit 0
fi

echo "[protect] 扫描生活分类..."

COUNT=0
# 用 find 查找所有 .md 文件
find "$LIFE_SRC" -name "*.md" | while read md_file; do
  # 提取 abbrlink
  ABBRLINK=$(grep -oP 'abbrlink:\s*\K\d+' "$md_file" 2>/dev/null || true)

  if [ -z "$ABBRLINK" ]; then
    echo "  跳过: $(basename "$md_file") (无 abbrlink)"
    continue
  fi

  TARGET_DIR="$PUBLIC_POSTS/$ABBRLINK"
  TARGET_FILE="$TARGET_DIR/index.html"

  if [ ! -f "$TARGET_FILE" ]; then
    echo "  跳过: $(basename "$md_file") → posts/$ABBRLINK (生成文件不存在)"
    continue
  fi

  # 检查是否已经加密
  if grep -q "staticrypt" "$TARGET_FILE" 2>/dev/null; then
    echo "  跳过: $(basename "$md_file") (已加密)"
    continue
  fi

  TITLE=$(grep -oP 'title:\s*\K.*' "$md_file" 2>/dev/null | head -1 || echo "受保护的文章")

  echo "  🔒 加密: $(basename "$md_file") → posts/$ABBRLINK/"

  npx staticrypt "$TARGET_FILE" \
    -p "$PASSWORD" \
    --template-title "🔒 $TITLE" \
    --short \
    -d "$TARGET_DIR" \
    --quiet 2>/dev/null || echo "    警告: 加密失败"

  COUNT=$((COUNT + 1))
done

echo "[protect] 完成，已加密 $COUNT 篇文章"
