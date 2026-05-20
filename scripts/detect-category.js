// 智能识别分类路径
// 用法: node scripts/detect-category.js <文件路径>
const path = require('path');
const config = require('./_watch-config.json');

const srcPath = process.argv[2].replace(/\\/g, '/');

let best = { category: '工作/随笔', len: 0 };

for (const w of config.watches) {
  const watchDir = w.dir.replace(/\\/g, '/').replace(/\/*$/, '');
  if (srcPath.startsWith(watchDir) && watchDir.length > best.len) {
    // 只用配置的分类，不提取源文件子目录
    best = { category: w.category, len: watchDir.length };
  }
}

console.log(best.category);
