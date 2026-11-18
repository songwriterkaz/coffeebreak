/* Owner access uses the same PIN hash as other Coffeebreak apps.
   Only the hash is stored. A correct PIN sets sessionStorage cbOwner. */
const PINH = '4dea5c7cb70f50322ec9d734aa4aa078be9227c05251e18991c596f387552370';
const OK = 'cbOwner';

function sha(m) {
  function R(n, x) { return (x >>> n) | (x << (32 - n)); }
  const K = [], H = [];
  let p = 2, c = 0;
  for (; c < 64; p++) {
    let j = 2;
    for (; j * j <= p; j++) if (p % j === 0) break;
    if (j * j > p) {
      if (c < 8) H[c] = (Math.pow(p, 1 / 2) * 4294967296) | 0;
      K[c++] = (Math.pow(p, 1 / 3) * 4294967296) | 0;
    }
  }
  const b = unescape(encodeURIComponent(m));
  const l = b.length * 8;
  const w = [];
  for (let i = 0; i < b.length; i++) w[i >> 2] |= b.charCodeAt(i) << (24 - (i % 4) * 8);
  w[l >> 5] |= 0x80 << (24 - l % 32);
  w[((l + 64 >> 9) << 4) + 15] = l;
  for (let i = 0; i < w.length; i += 16) {
    const a = H.slice(0);
    const W = [];
    for (let j = 0; j < 64; j++) {
      if (j < 16) W[j] = w[i + j] | 0;
      else {
        const x = W[j - 15], y = W[j - 2];
        W[j] = (W[j - 16] + (R(7, x) ^ R(18, x) ^ (x >>> 3)) + W[j - 7] + (R(17, y) ^ R(19, y) ^ (y >>> 10))) | 0;
      }
      const t1 = a[7] + (R(6, a[4]) ^ R(11, a[4]) ^ R(25, a[4])) + ((a[4] & a[5]) ^ (~a[4] & a[6])) + K[j] + W[j];
      const t2 = (R(2, a[0]) ^ R(13, a[0]) ^ R(22, a[0])) + ((a[0] & a[1]) ^ (a[0] & a[2]) ^ (a[1] & a[2]));
      a.unshift((t1 + t2) | 0);
      a[4] = (a[4] + t1) | 0;
      a.pop();
    }
    for (let j = 0; j < 8; j++) H[j] = (H[j] + a[j]) | 0;
  }
  let o = '';
  for (let i = 0; i < 8; i++) o += ('00000000' + (H[i] >>> 0).toString(16)).slice(-8);
  return o;
}

export function ownerOn() {
  try { return sessionStorage.getItem(OK) === PINH; } catch (e) { return false; }
}

export function ownerOff() {
  try { sessionStorage.removeItem(OK); } catch (e) { /* session storage may be blocked */ }
}

export function ownerUnlock(pin) {
  if (sha(String(pin)) !== PINH) return false;
  try { sessionStorage.setItem(OK, PINH); } catch (e) { /* still unlock this page view */ }
  return true;
}
