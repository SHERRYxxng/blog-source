#!/usr/bin/env node
// 智能识别分类路径
// 用法: node scripts/detect-category.js <文件路径>
const path = require('path');
const config = require('./watch-config.json');

const srcPath = process.argv[2].replace(/\\/g, '/');

let best = { category: '工作/随笔', len: 0 };

for (const w of config.watches) {
  const watchDir = w.dir.replace(/\\/g, '/').replace(/\/*$/, '');
  if (srcPath.startsWith(watchDir) && watchDir.length > best.len) {
    const subdir = path.dirname(srcPath.slice(watchDir.length).replace(/^\//, ''));
    const category = subdir && subdir !== '.' ? w.category + '/' + subdir : w.category;
    best = { category, len: watchDir.length };
  }
}

console.log(best.category);
