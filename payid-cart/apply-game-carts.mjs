import { writeFileSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const game = require('./game-cart.js');
const root = new URL('..', import.meta.url);
const pages = game.listCartPages(root.pathname);
let changed = 0;
for (const rel of pages) {
  if (/autism-planner/.test(rel)) continue;
  const file = new URL('../' + rel, import.meta.url);
  const html = readFileSync(file, 'utf8');
  const next = game.mountPage(html, rel);
  if (next !== html) {
    writeFileSync(file, next);
    changed += 1;
  }
}
const directories = ['yellow-pages/index.html', 'yellow-pages/data.json', 'apps/what-i-need-now/index.html'];
let dirs = 0;
for (const rel of directories) {
  const file = new URL('../' + rel, import.meta.url);
  const text = readFileSync(file, 'utf8');
  const next = game.replaceDirectoryWording(text);
  if (next !== text) {
    writeFileSync(file, next);
    dirs += 1;
  }
}
console.log('CARTS applied pages=' + pages.length + ' changed=' + changed + ' directories=' + dirs);
