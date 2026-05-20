#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const CONFIG_FILE = path.join(__dirname, "watch-config.json");
const PROJECT_ROOT = path.join(__dirname, "..");
const POSTS_DIR = path.join(PROJECT_ROOT, "source", "_posts");
const DEFAULT_CATEGORY = "工作/随笔";

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ watches: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function addWatchDir(dir, category) {
  const config = loadConfig();
  const absDir = path.resolve(dir);
  if (!config.watches.find((w) => w.dir === absDir)) {
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
      if (entry.endsWith(".md") && fs.statSync(fullPath).isFile()) {
        results.push(fullPath);
      }
    }
  } catch (e) {}
  return results;
}

function addFrontMatter(content, filePath, category) {
  if (content.startsWith("---")) return content;
  const title = path.basename(filePath, ".md");
  const categoryTags = category.split("/").filter(Boolean);
  const tags = [categoryTags[categoryTags.length - 1]];
  const categoryLines = categoryTags.map((c) => `  - ${c}`).join("\n");
  return `---
title: ${title}
categories:
${categoryLines}
tags:
${tags.map((t) => `  - ${t}`).join("\n")}
date: ${new Date().toISOString().split("T")[0]}
---

${content}`;
}

function processFile(filePath, category) {
  const config = loadConfig();
  const watchEntry = config.watches.find((w) => filePath.startsWith(w.dir));
  if (!watchEntry) return false;

  const cat = category || watchEntry.category || DEFAULT_CATEGORY;
  const targetSubDir = cat.replace(/\/g, "/");
  const targetDir = path.join(POSTS_DIR, targetSubDir);

  // Date prefix on filename
  const baseName = path.basename(filePath);
  const today = new Date().toISOString().split("T")[0];
  const datedName = /^\d{4}-\d{2}-\d{2}-/.test(baseName)
    ? baseName
    : `${today}-${baseName}`;
  const targetFile = path.join(targetDir, datedName);

  if (fs.existsSync(targetFile)) {
    const srcContent = fs.readFileSync(filePath, "utf-8");
    const dstContent = fs.readFileSync(targetFile, "utf-8");
    if (srcContent === dstContent) return false;
  }

  console.log(`[watch] Processing: ${filePath} → ${targetSubDir}/${datedName}`);
  fs.mkdirSync(targetDir, { recursive: true });

  let content = fs.readFileSync(filePath, "utf-8");
  content = addFrontMatter(content, filePath, cat);
  fs.writeFileSync(targetFile, content);
  return true;
}

function deploy() {
  console.log("[watch] Running hexo generate...");
  execSync("npx hexo generate", { cwd: PROJECT_ROOT, stdio: "inherit" });
  try { execSync("bash scripts/protect.sh", { cwd: PROJECT_ROOT, stdio: "inherit" }); } catch (e) {}

  console.log("[watch] Deploying to public repo...");
  const publicRepo = path.join(PROJECT_ROOT, "..", "sherry-pages");
  if (!fs.existsSync(path.join(publicRepo, ".git"))) {
    execSync('git clone git@github.com:SHERRYxxng/SHERRYxxng.github.io.git "' + publicRepo + '"', { stdio: "inherit" });
  }

  const publicDir = path.join(PROJECT_ROOT, "public");
  execSync('find "' + publicRepo + '" -mindepth 1 -maxdepth 1 -not -name ".git" -exec rm -rf {} + 2>/dev/null || true');
  execSync('cp -r "' + publicDir + '"/* "' + publicRepo + '/" && cp -r "' + publicDir + '/.github" "' + publicRepo + '/" 2>/dev/null || true');
  fs.writeFileSync(path.join(publicRepo, ".nojekyll"), "");

  const ts = new Date().toISOString().slice(0, 19).replace("T", " ");
  execSync('cd "' + publicRepo + '" && git add -A && git commit -m "Auto deploy: ' + ts + '" && git push origin main', { stdio: "inherit" });
  console.log("[watch] Deploy complete!");
}

function scan() {
  const config = loadConfig();
  let changed = false;
  for (const w of config.watches) {
    const files = findMdFiles(w.dir);
    for (const file of files) {
      if (processFile(file, w.category)) changed = true;
    }
  }
  return changed;
}

const args = process.argv.slice(2);

if (args[0] === "add") {
  if (args.length < 3) { console.log('Usage: node scripts/watch.js add <dir> <category>'); process.exit(1); }
  addWatchDir(args[1], args[2]);
} else if (args[0] === "list") {
  const config = loadConfig();
  console.log("Watched directories:");
  for (const w of config.watches) console.log(`  ${w.dir} → ${w.category}`);
} else if (args[0] === "--once") {
  console.log("[watch] Scanning once...");
  if (scan()) { deploy(); } else { console.log("[watch] No changes detected."); }
} else {
  console.log("[watch] Starting watcher... polling every 30s. Ctrl+C to stop.");
  setInterval(() => { if (scan()) { try { deploy(); } catch (e) { console.error(e.message); } } }, 30000);
}
