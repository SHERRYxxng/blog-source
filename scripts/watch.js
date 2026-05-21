const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PROJECT_ROOT = path.join(__dirname, "..");
const POSTS_DIR = path.join(PROJECT_ROOT, "source", "_posts");

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

// Derive category from file path relative to _posts/ (max 2 levels)
// e.g. _posts/生活/随笔/xxx.md → 生活/随笔
//      _posts/工作/蒲公英/后端/xxx.md → 工作/蒲公英 (后端 is beyond 2 levels)
function deriveCategory(filePath) {
  const rel = path.relative(POSTS_DIR, filePath);
  const parts = rel.split(path.sep);
  parts.pop(); // remove filename
  return parts.slice(0, 3).join("/");
}

function addFrontMatter(content, filePath, category) {
  if (content.startsWith("---")) return content;

  const rawTitle = path.basename(filePath, ".md");
  // Remove date prefix like 2026-05-21- from title
  const title = rawTitle.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  const categoryTags = category.split("/").filter(Boolean);
  const tags = [...categoryTags];

  const lines = ["---", "title: " + title, "categories:"];
  categoryTags.forEach(c => lines.push("  - " + c));
  lines.push("tags:");
  tags.forEach(t => lines.push("  - " + t));
  lines.push("date: " + new Date().toISOString().split("T")[0]);
  lines.push("---");
  lines.push("");
  lines.push(content);
  return lines.join("\n");
}

function processFile(filePath) {
  const category = deriveCategory(filePath);
  if (!category) return false;

  const content = fs.readFileSync(filePath, "utf-8");
  if (content.startsWith("---")) return false; // already has front matter

  const dir = path.dirname(filePath);
  const baseName = path.basename(filePath);
  const today = new Date().toISOString().split("T")[0];

  // Add date prefix if missing
  const newName = /^\d{4}-\d{2}-\d{2}-/.test(baseName)
    ? baseName
    : today + "-" + baseName;
  const newPath = path.join(dir, newName);

  console.log("[watch] Processing: " + path.basename(filePath) + " → " + category);
  const processed = addFrontMatter(content, filePath, category);
  fs.writeFileSync(newPath, processed);

  // Remove old file if name changed
  if (newPath !== filePath) {
    fs.unlinkSync(filePath);
    console.log("[watch] Renamed: " + baseName + " → " + newName);
  }
  return true;
}

function scan() {
  let changed = false;
  const files = findMdFiles(POSTS_DIR);
  for (const file of files) {
    if (processFile(file)) changed = true;
  }
  return changed;
}

function deploy() {
  console.log("[watch] Running hexo generate...");
  execSync("npx hexo generate", { cwd: PROJECT_ROOT, stdio: "inherit" });

  console.log("[watch] Deploying to public repo...");
  const publicRepo = path.join(PROJECT_ROOT, "..", "sherry-pages");
  if (!fs.existsSync(path.join(publicRepo, ".git"))) {
    console.log("[watch] Cloning public repo...");
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

const args = process.argv.slice(2);

if (args[0] === "--deploy") {
  console.log("[watch] Force deploy (skip scan)...");
  deploy();
  process.exit(0);
}

if (args[0] === "--once") {
  console.log("[watch] Scanning source/_posts/ for new files...");
  const changed = scan();
  if (changed) {
    console.log("[watch] New files processed.");
  } else {
    console.log("[watch] No new files (all have front matter).");
  }
  console.log("[watch] Generating and deploying...");
  deploy();
  process.exit(0);
}

// Default: watch mode - poll source/_posts/
console.log("[watch] Watching source/_posts/ for new .md files...");
console.log("[watch] Drop a .md file in any subfolder, and it will auto-add front matter + deploy.");
setInterval(function() {
  if (scan()) {
    console.log("[watch] Changes detected, deploying...");
    try { deploy(); } catch (e) { console.error("[watch] Deploy error:", e.message); }
  }
}, 30000);
console.log("[watch] Polling every 30s. Press Ctrl+C to stop.");
