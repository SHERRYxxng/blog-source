#!/usr/bin/env node
// 一键构建部署：扫描 source/_posts/ 下所有 .md，自动分类、加日期、生成、部署
// 用法: node scripts/build.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PROJECT_ROOT = path.join(__dirname, "..");
const POSTS_DIR = path.join(PROJECT_ROOT, "source", "_posts");
const PUBLIC_REPO = "C:/Users/13247/AppData/Local/Temp/SHERRYxxng.github.io";
const TODAY = new Date().toISOString().split("T")[0];

// 递归扫描所有 .md
const mdFiles = [];
function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { scan(full); }
    else if (entry.name.endsWith(".md")) { mdFiles.push(full); }
  }
}
scan(POSTS_DIR);

if (mdFiles.length === 0) {
  console.log("没有找到 .md 文件");
  process.exit(0);
}

let changed = false;

for (const src of mdFiles) {
  const rel = path.relative(POSTS_DIR, src);      // e.g. "工作/电话告警/xxx.md"
  const category = path.dirname(rel).replace(/\\/g, "/"); // e.g. "工作/电话告警"
  const baseName = path.basename(src);             // e.g. "xxx.md"
  const title = baseName.replace(/\.md$/, "");

  // 文件名加当天日期前缀（已有则跳过）
  const needDate = !/^\d{4}-\d{2}-\d{2}-/.test(baseName);
  const newName = needDate ? `${TODAY}-${baseName}` : baseName;
  const dest = path.join(path.dirname(src), newName);

  let content = fs.readFileSync(src, "utf-8");

  // 添加 front-matter（如果没有）
  if (!content.startsWith("---")) {
    const catParts = category ? category.split("/").filter(Boolean) : ["工作"];
    const tagLines = catParts.map(c => `  - ${c}`).join("\n");

    content = `---
title: ${title}
categories:
  - ${catParts[0]}
tags:
${tagLines}
date: ${TODAY}
---

${content}`;
  }

  // 写入（如有日期变化则移动）
  if (needDate) {
    fs.unlinkSync(src);
    fs.writeFileSync(dest, content);
    console.log(`  ✓ ${category}/${newName}`);
  } else {
    fs.writeFileSync(src, content);
    console.log(`  ✓ ${category}/${baseName}`);
  }
  changed = true;
}

if (!changed) { console.log("没有变化"); process.exit(0); }

// 生成
console.log("\n生成 HTML...");
execSync("npx hexo generate", { cwd: PROJECT_ROOT, stdio: "inherit" });

// 加密
try { execSync("bash scripts/protect.sh", { cwd: PROJECT_ROOT, stdio: "inherit" }); } catch (e) {}

// 部署到公开仓库
console.log("部署...");
if (!fs.existsSync(path.join(PUBLIC_REPO, ".git"))) {
  execSync('git clone git@github.com:SHERRYxxng/SHERRYxxng.github.io.git "' + PUBLIC_REPO + '"', { stdio: "inherit" });
}
execSync('cd "' + PUBLIC_REPO + '" && find . -mindepth 1 -maxdepth 1 -not -name ".git" -exec rm -rf {} + 2>/dev/null || true');
const publicDir = path.join(PROJECT_ROOT, "public");
execSync('cp -r "' + publicDir + '"/* "' + PUBLIC_REPO + '/"');
try { execSync('cp -r "' + publicDir + '/.github" "' + PUBLIC_REPO + '/" 2>/dev/null'); } catch (e) {}
fs.writeFileSync(path.join(PUBLIC_REPO, ".nojekyll"), "");

try {
  execSync('cd "' + PUBLIC_REPO + '" && git add -A && git commit -m "Build: ' + TODAY + '" && git push origin main', { stdio: "inherit" });
} catch (e) { console.log("公开仓库无变化，跳过"); }

// 提交私人仓库
try {
  execSync('git add -A && git commit -m "Build: ' + TODAY + '" && git push origin master', { cwd: PROJECT_ROOT, stdio: "inherit" });
} catch (e) { console.log("私人仓库无变化，跳过"); }

console.log("\n完成! https://sherryxxng.github.io");
