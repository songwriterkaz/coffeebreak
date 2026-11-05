// Local test harness: runs the Netlify function on http://127.0.0.1:8899 and serves the app on :8898
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
process.env.SANITY_TOKEN = fs.readFileSync('/workspace/private/sanity-token.txt', 'utf8').trim();
const { default: handler } = await import('./netlify/functions/api.mjs');
http.createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c);
  const body = ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? undefined : Buffer.concat(chunks);
  const r = await handler(new Request('http://127.0.0.1:8899' + req.url, { method: req.method, headers: req.headers, body }));
  res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer()));
}).listen(8899);
const root = '/workspace/coffeebreak-tube/dist';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.json': 'application/json' };
http.createServer((req, res) => { let f = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); res.end(d); }); }).listen(3333);
console.log('ready');
