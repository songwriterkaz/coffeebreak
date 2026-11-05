// Coffeebreak Tube API on Cloudflare Workers (free plan). Same API as the old Netlify function.
import handler, { setToken } from './api.mjs';
const LANDING = `<!doctype html><meta charset="utf-8"><title>Coffeebreak Tube API</title><p>Coffeebreak Tube shared video service. Open the app at <a href="https://coffeebreaks.itch.io/coffeebreak-tube">https://coffeebreaks.itch.io/coffeebreak-tube</a></p>`;
export default {
  async fetch(req, env) {
    setToken(env.SANITY_TOKEN);
    const u = new URL(req.url);
    if (req.method === 'GET' && !u.searchParams.has('a')) return new Response(LANDING, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    return handler(req);
  }
};
