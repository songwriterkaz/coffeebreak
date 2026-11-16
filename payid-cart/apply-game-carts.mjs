import { writeFileSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const game = require('./game-cart.js');
const root = new URL('..', import.meta.url);
const pages = game.listGamePages(root.pathname);
let changed = 0;
for (const rel of pages) {
  const file = new URL('../' + rel, import.meta.url);
  const html = readFileSync(file, 'utf8');
  const next = game.mountPage(html, rel);
  if (next !== html) {
    writeFileSync(file, next);
    changed += 1;
  }
}
console.log('GAME CARTS applied pages=' + pages.length + ' changed=' + changed);
