// Headless Chrome over the DevTools protocol with no dependencies (Node 24 has a global WebSocket), plus a tiny
// static server that serves site/ the way Vercel does: clean URLs, trailing slash, brotli for text, byte ranges for video.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';
import { spawn } from 'node:child_process';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.mp4': 'video/mp4',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon',
};
const COMPRESSIBLE = /^(text\/|application\/(json|xml)|image\/svg)/;

/** Serve `root` on 127.0.0.1. Resolves to { port, origin, close() }. */
export function serveSite(root, port = 0, extraHeaders = {}) {
  root = path.resolve(root);
  const brCache = new Map();
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const rel = decodeURIComponent(url.pathname);
    let file = path.join(root, rel);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    let st = fs.statSync(file, { throwIfNoEntry: false });
    if (st?.isDirectory()) {
      if (!rel.endsWith('/')) { res.writeHead(308, { location: rel + '/' + url.search }).end(); return; }
      file = path.join(file, 'index.html');
      st = fs.statSync(file, { throwIfNoEntry: false });
    } else if (!st && fs.existsSync(file + '.html')) {
      file += '.html';
      st = fs.statSync(file);
    }
    let status = 200;
    if (!st) {
      status = 404;
      file = path.join(root, '404.html');
      st = fs.statSync(file, { throwIfNoEntry: false });
      if (!st) { res.writeHead(404).end(); return; }
    }
    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const headers = { 'content-type': type, 'cache-control': 'no-store', 'accept-ranges': 'bytes', ...extraHeaders };
    if (type === 'video/mp4' && req.headers.range) {
      const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range) || [];
      const start = m[1] ? +m[1] : 0;
      const end = m[2] ? Math.min(+m[2], st.size - 1) : st.size - 1;
      res.writeHead(206, { ...headers, 'content-range': `bytes ${start}-${end}/${st.size}`, 'content-length': end - start + 1 });
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }
    let body = fs.readFileSync(file);
    if (COMPRESSIBLE.test(type) && /\bbr\b/.test(req.headers['accept-encoding'] || '')) {
      const key = file + ':' + st.mtimeMs;
      if (!brCache.has(key)) brCache.set(key, zlib.brotliCompressSync(body, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }));
      body = brCache.get(key);
      headers['content-encoding'] = 'br';
      headers.vary = 'accept-encoding';
    }
    headers['content-length'] = body.length;
    res.writeHead(status, headers);
    res.end(req.method === 'HEAD' ? undefined : body);
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => {
    const p = server.address().port;
    resolve({ port: p, origin: `http://127.0.0.1:${p}`, close: () => new Promise((r) => server.close(r)) });
  }));
}

/** One CDP connection (a page target). Every send has its own timeout, so a stalled compositor can't hang a run. */
export class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map(); this.handlers = new Map();
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id) {
        const p = this.pending.get(m.id);
        if (p) { this.pending.delete(m.id); m.error ? p.rej(new Error(`${p.method}: ${m.error.message}`)) : p.res(m.result); }
      } else {
        for (const f of this.handlers.get(m.method) || []) f(m.params);
      }
    };
  }
  static async open(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('websocket failed: ' + url)); });
    return new CDP(ws);
  }
  send(method, params = {}, timeout = 30000) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      const t = setTimeout(() => { this.pending.delete(id); rej(new Error(`timeout ${method}`)); }, timeout);
      this.pending.set(id, { method, res: (v) => { clearTimeout(t); res(v); }, rej: (e) => { clearTimeout(t); rej(e); } });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  on(event, fn) { if (!this.handlers.has(event)) this.handlers.set(event, []); this.handlers.get(event).push(fn); }
  once(event, timeout = 30000) {
    return new Promise((res) => {
      const t = setTimeout(() => res(null), timeout);
      this.on(event, (p) => { clearTimeout(t); res(p); });
    });
  }
  /** Evaluate an expression (may return a promise) and return its value; throws on a page exception. */
  async eval(expression, timeout = 30000) {
    const r = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, timeout);
    if (r.exceptionDetails) throw new Error('page: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text).split('\n')[0]);
    return r.result.value;
  }
  close() { try { this.ws.close(); } catch { /* already closed */ } }
}

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/** Launch a private headless Chrome. Resolves to { newPage(), closePage(c), close() }. */
export async function launchChrome() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-chrome-'));
  const proc = spawn(CHROME, [
    '--headless=new', '--no-sandbox', '--remote-debugging-port=0', `--user-data-dir=${dir}`, '--hide-scrollbars', '--no-first-run',
    '--no-default-browser-check', '--disable-extensions', '--disable-background-networking', '--disable-component-update',
    '--disable-sync', '--mute-audio', '--force-color-profile=srgb', '--disable-renderer-backgrounding',
    '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows',
  ], { stdio: 'ignore' });
  let port = 0;
  for (let i = 0; i < 300 && !port; i++) {
    await sleep(50);
    try { port = +fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split('\n')[0]; } catch { /* not yet */ }
  }
  if (!port) { proc.kill(); throw new Error('chrome did not start'); }
  const base = `http://127.0.0.1:${port}`;
  return {
    async newPage() {
      const t = await (await fetch(`${base}/json/new?about:blank`, { method: 'PUT' })).json();
      const c = await CDP.open(t.webSocketDebuggerUrl);
      c.targetId = t.id;
      return c;
    },
    async closePage(c) { c.close(); try { await fetch(`${base}/json/close/${c.targetId}`); } catch { /* gone */ } },
    async close() {
      if (proc.exitCode === null) {
        const exited = new Promise((r) => proc.once('exit', r));
        proc.kill();
        await Promise.race([exited, sleep(5000)]);
      }
      try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 }); } catch { /* Chrome still flushing; the OS clears tmp */ }
    },
  };
}
