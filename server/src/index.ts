import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { csrf } from 'hono/csrf';
import fs from 'node:fs';
import path from 'node:path';
import type { Server } from 'node:http';
import { env } from './env.js';
import { api } from './routes.js';
import { attachVncRelay } from './vnc.js';
import { initRoutines } from './routines.js';
import { initTriggers } from './triggers.js';
import { initProactive } from './proactive.js';
import { initSubagents } from './agent/subagents.js';
import { initRooms } from './agent/rooms.js';
import { checkinsApi } from './routes-proactive.js';
import { roomsApi } from './routes-rooms.js';
import { enqueue } from './agent/loop.js';
import { desSelfTest } from './lib/des.js';
import { configApi } from './routes-config.js';
import { startIdleWatcher } from './idle.js';
import { startMemoryConsolidation } from './agent/memory.js';

if (!desSelfTest()) throw new Error('DES self-test failed');
initSubagents();
initRooms();

const app = new Hono();
// Cookie auth: reject cross-origin form/text POSTs (JSON requests already need a CORS preflight, which we never allow).
app.use('/api/*', csrf({ origin: env.trustedOrigins }));
app.get('/api/health', (c) => c.json({ ok: true, model: env.xaiModel }));
app.route('/api/checkins', checkinsApi);
app.route('/api/rooms', roomsApi);
app.route('/api', api);
app.route('/api', configApi);

// Serve the built web app in production.
const webDist = path.resolve(new URL('.', import.meta.url).pathname, '../../web/dist');
if (fs.existsSync(webDist)) {
  app.use('/*', serveStatic({ root: path.relative(process.cwd(), webDist) }));
  app.get('*', (c) => c.html(fs.readFileSync(path.join(webDist, 'index.html'), 'utf8')));
}

const server = serve({ fetch: app.fetch, port: env.port, hostname: env.host }, (info) => console.log(`[grokbot] server on http://${env.host.includes(':') ? `[${env.host}]` : env.host}:${info.port} (model ${env.xaiModel})`));
if (!env.allowedEmails.length && !env.openSignup) console.warn('[auth] ALLOWED_EMAILS is not set and SERVER_URL is not localhost: new sign-ups are disabled.');
if (env.devLoginRequested && !env.devLogin) console.warn('[auth] DEV_LOGIN=1 ignored: dev sign-in only works when HOST is loopback and SERVER_URL is a localhost URL.');
attachVncRelay(server as unknown as Server);
// GROKBOT_NO_SCHEDULER=1 for extra dev/test servers sharing a database copy, so routines and triggers don't fire twice.
if (process.env.GROKBOT_NO_SCHEDULER !== '1') {
  initRoutines(enqueue);
  void initTriggers(enqueue);
initProactive(enqueue);
} else console.log('[grokbot] scheduler disabled (GROKBOT_NO_SCHEDULER=1)');
startIdleWatcher();
startMemoryConsolidation();
