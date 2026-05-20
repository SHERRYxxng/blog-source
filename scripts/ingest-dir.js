#!/usr/bin/env node
// 一键扫描导入：扫描目录下所有 .md，自动分类 + 生成 + 部署
// 用法: node scripts/ingest-dir.js <目录路径>
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PROJECT_ROOT = path.join(__dirname, "..");
const POSTS_DIR = path.join(PROJECT_ROOT, "source", "_posts");
const PUBLIC_REPO = "C:/Users/13247/AppData/Local/Temp/SHERRYxxng.github.io";
const DEFAULT_CAT = "工作/随笔";

const scanDir = process.argv[2];
if (!scanDir) {
  console.log("用法: node scripts/ingest-dir.js <目录路径>");
  console.log('示例: node scripts/ingest-dir.js "E:/work/新项目/docs"');
  process.exit(1);
}

if (!fs.existsSync(scanDir)) {
  console.log("错误: 目录不存在 - " + scanDir);
  process.exit(1);
}

// 扫描所有 .md 文件
const mdFiles = [];
function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(full);
    else if (entry.name.endsWith(".md")) mdFiles.push(full);
  }
}
scan(scanDir);

if (mdFiles.length === 0) {
  console.log("没有找到 .md 文件");
  process.exit(0);
}

console.log(`找到 ${mdFiles.length} 个 .md 文件\n`);

// 逐个处理
let count = 0;
for (const src of mdFiles) {
  const fname = path.basename(src);
  const title = fname.replace(/\.md$/, "");

  // 日期前缀
  const stat = fs.statSync(src);
  const fileDate = new Date(stat.mtime).toISOString().split("T")[0];
  const datedName = /^\d{4}-\d{2}-\d{2}-/.test(fname) ? fname : `${fileDate}-${fname}`;

  const targetDir = path.join(POSTS_DIR, DEFAULT_CAT);
  fs.mkdirSync(targetDir, { recursive: true });

  const dest = path.join(targetDir, datedName);
  let content = fs.readFileSync(src, "utf-8");

  // front-matter
  if (!content.startsWith("---")) {
    content = `---
title: ${title}
categories: 工作
tags:
  - 随笔
date: ${fileDate}
---

${content}`;
  }

  fs.writeFileSync(dest, content);
  console.log(`  ✓ ${fname} → source/_posts/${DEFAULT_CAT}/${datedName}`);
  count++;
}

// 生成
console.log("\n生成静态页面...");
execSync("npx hexo generate", { cwd: PROJECT_ROOT, stdio: "inherit" });

// 保护
try { execSync("bash scripts/protect.sh", { cwd: PROJECT_ROOT, stdio: "inherit" }); } catch (e) {}

// 部署
console.log("部署到公开仓库...");
if (!fs.existsSync(path.join(PUBLIC_REPO, ".git"))) {
  execSync('git clone git@github.com:SHERRYxxng/SHERRYxxng.github.io.git "' + PUBLIC_REPO + '"', { stdio: "inherit" });
}

execSync('find "' + PUBLIC_REPO + '" -mindepth 1 -maxdepth 1 -not -name ".git" -exec rm -rf {} + 2>/dev/null || true');
execSync('cp -r "' + path.join(PROJECT_ROOT, "public") + '"/* "' + PUBLIC_REPO + '/"');
try { execSync('cp -r "' + path.join(PROJECT_ROOT, "public") + '/.github" "' + PUBLIC_REPO + '/" 2>/dev/null'); } catch (e) {}
fs.writeFileSync(path.join(PUBLIC_REPO, ".nojekyll"), "");

execSync('cd "' + PUBLIC_REPO + '" && git add -A && git commit -m "Auto ingest: ' + count + ' posts" && git push origin main', { stdio: "inherit" });

// 提交私人仓库
execSync("git add -A && git commit -m 'Ingest " + count + " posts from " + path.basename(scanDir) + "' && git push origin master", { cwd: PROJECT_ROOT, stdio: "inherit" });

console.log(`\n完成! 已导入 ${count} 篇文章 → https://sherryxxng.github.io`);
