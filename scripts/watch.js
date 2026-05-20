#!/usr/bin/env node
/**
 * 文件监听器：监控指定目录，自动同步 .md 到 source/_posts/ 并部署
 *
 * 用法:
 *   node scripts/watch.js                     # 启动监听
 *   node scripts/watch.js --once              # 只扫描一次
 *   node scripts/watch.js add <目录> <分类>    # 添加监听目录
 *   node scripts/watch.js list               # 列出监听目录
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG_FILE = path.join(__dirname, 'watch-config.json');
const PROJECT_ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(PROJECT_ROOT, 'source', '_posts');
const DEFAULT_CATEGORY = '工作/随笔';

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ watches: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function addWatchDir(dir, category) {
  const config = loadConfig();
  const absDir = path.resolve(dir);
  if (!config.watches.find(w => w.dir === absDir)) {
    config.watches.push({ dir: absDir, category });
    saveConfig(config);
    console.log(`[watch] Added: ${absDir} → ${category}`);
  } else {
    console.log(`[watch] Already exists: ${absDir}`);
  }
}

function findMdFiles(dir) {
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { recursive: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      if (entry.endsWith('.md') && fs.statSync(fullPath).isFile()) {
        results.push(fullPath);
      }
    }
  } catch (e) { /* ignore permission errors */ }
  return results;
}

function getCategory(dir, config) {
  for (const w of config.watches) {
    if (dir.startsWith(w.dir)) {
      return w.category;
    }
  }
  return null;
}

function getRelativePath(filePath, watchDir) {
  const rel = path.relative(watchDir, filePath);
  return path.dirname(rel); // subdirectory within watch dir
}

function addFrontMatter(content, filePath, category) {
  if (content.startsWith('---')) return content;

  const title = path.basename(filePath, '.md');
  const categoryTags = category.split('/').filter(Boolean);
  const tags = [categoryTags[categoryTags.length - 1]];

  return `---
title: ${title}
categories: ${categoryTags[0] || '工作'}
tags:
${tags.map(t => `  - ${t}`).join('\n')}
date: ${new Date().toISOString().split('T')[0]}
---

${content}`;
}

function processFile(filePath, category) {
  const config = loadConfig();
  const watchEntry = config.watches.find(w => filePath.startsWith(w.dir));
  if (!watchEntry) return false;

  const cat = category || watchEntry.category || DEFAULT_CATEGORY;
  const relDir = getRelativePath(filePath, watchEntry.dir);

  // Build target path in source/_posts/
  let targetSubDir = cat.replace(/\\/g, '/');
  if (relDir && relDir !== '.') {
    targetSubDir = targetSubDir + '/' + relDir.replace(/\\/g, '/');
  }

  const targetDir = path.join(POSTS_DIR, targetSubDir);
  const targetFile = path.join(targetDir, path.basename(filePath));

  // Skip if file already exists and unchanged
  if (fs.existsSync(targetFile)) {
    const srcContent = fs.readFileSync(filePath, 'utf-8');
    const dstContent = fs.readFileSync(targetFile, 'utf-8');
    if (srcContent === dstContent) return false;
  }

  console.log(`[watch] Processing: ${filePath} → ${targetSubDir}/`);
  fs.mkdirSync(targetDir, { recursive: true });

  let content = fs.readFileSync(filePath, 'utf-8');
  content = addFrontMatter(content, filePath, cat);
  fs.writeFileSync(targetFile, content);

  return true;
}

function deploy() {
  console.log('[watch] Running hexo generate...');
  execSync('npx hexo generate', { cwd: PROJECT_ROOT, stdio: 'inherit' });

  console.log('[watch] Deploying to public repo...');
  const publicRepo = path.join(PROJECT_ROOT, '..', 'sherry-pages');

  if (!fs.existsSync(path.join(publicRepo, '.git'))) {
    console.log('[watch] Cloning public repo...');
    execSync('git clone git@github.com:SHERRYxxng/SHERRYxxng.github.io.git "' + publicRepo + '"', { stdio: 'inherit' });
  }

  const publicDir = path.join(PROJECT_ROOT, 'public');

  // Clean and copy
  execSync('find "' + publicRepo + '" -mindepth 1 -maxdepth 1 -not -name ".git" -exec rm -rf {} + 2>/dev/null || true');
  execSync('cp -r "' + publicDir + '"/* "' + publicRepo + '/" && cp -r "' + publicDir + '/.github" "' + publicRepo + '/" 2>/dev/null || true');
  fs.writeFileSync(path.join(publicRepo, '.nojekyll'), '');

  // Commit and push
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  execSync('cd "' + publicRepo + '" && git add -A && git commit -m "Auto deploy: ' + timestamp + '" && git push origin main', { stdio: 'inherit' });

  console.log('[watch] Deploy complete!');
}

function scan() {
  const config = loadConfig();
  let changed = false;

  for (const w of config.watches) {
    const files = findMdFiles(w.dir);
    for (const file of files) {
      if (processFile(file, w.category)) {
        changed = true;
      }
    }
  }

  return changed;
}

// --- Main ---
const args = process.argv.slice(2);

if (args[0] === 'add') {
  if (args.length < 3) {
    console.log('Usage: node scripts/watch.js add <目录> <分类>');
    console.log('Example: node scripts/watch.js add "E:/work/Nightingale/docs" "工作/电话告警"');
    process.exit(1);
  }
  addWatchDir(args[1], args[2]);
  process.exit(0);
}

if (args[0] === 'list') {
  const config = loadConfig();
  console.log('Watched directories:');
  for (const w of config.watches) {
    console.log(`  ${w.dir} → ${w.category}`);
  }
  process.exit(0);
}

if (args[0] === '--once') {
  console.log('[watch] Scanning once...');
  if (scan()) {
    deploy();
  } else {
    console.log('[watch] No changes detected.');
  }
  process.exit(0);
}

// Default: watch mode
console.log('[watch] Starting file watcher...');
const config = loadConfig();
console.log('[watch] Watching ' + config.watches.length + ' directories');
for (const w of config.watches) {
  console.log('  ' + w.dir + ' → ' + w.category);
}

// Poll every 30 seconds
setInterval(() => {
  if (scan()) {
    console.log('[watch] Changes detected, deploying...');
    try { deploy(); } catch (e) { console.error('[watch] Deploy error:', e.message); }
  }
}, 30000);

console.log('[watch] Polling every 30s. Press Ctrl+C to stop.');
