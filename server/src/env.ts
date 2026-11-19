function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);
const isLoopbackUrl = (u: string) => {
  try { return LOOPBACK_HOSTS.has(new URL(u).hostname); } catch { return false; }
};

/** Interface to listen on. Loopback by default; set HOST=0.0.0.0 only behind auth (see SECURITY.md). */
const host = process.env.HOST ?? '127.0.0.1';
const serverUrl = process.env.SERVER_URL ?? `http://localhost:${process.env.PORT ?? 8787}`;

export const env = {
  port: Number(process.env.PORT ?? 8787),
  host,
  appUrl: process.env.APP_URL ?? 'http://localhost:5173',
  /** Public URL of this server, used for OAuth callbacks. */
  serverUrl,
  xaiKey: req('XAI_API_KEY'),
  xaiModel: process.env.XAI_MODEL ?? 'grok-4.7',
  composioKey: req('COMPOSIO_API_KEY'),
  orgoKey: req('ORGO_API_KEY'),
  /** Orgo workspace that holds every user's box. */
  orgoWorkspaceId: process.env.ORGO_WORKSPACE_ID ?? '',
  /** Orgo box size for new users. */
  orgoRamGb: Number(process.env.ORGO_RAM_GB ?? 8),
  orgoCpu: Number(process.env.ORGO_CPU ?? 2),
  orgoResolution: process.env.ORGO_RESOLUTION ?? '1280x800x24',
  sessionSecret: req('SESSION_SECRET'),
  /**
   * Passwordless email sign-in for local testing. It lets anyone sign in as any email, so it only
   * turns on when the server listens on loopback and SERVER_URL is a localhost URL.
   */
  devLogin: process.env.DEV_LOGIN === '1' && LOOPBACK_HOSTS.has(host) && isLoopbackUrl(serverUrl),
  devLoginRequested: process.env.DEV_LOGIN === '1',
  /** Mark cookies Secure when the server is reached over HTTPS. */
  secureCookies: serverUrl.startsWith('https://'),
  dbPath: process.env.DB_PATH ?? new URL('../../data/grokbot.db', import.meta.url).pathname,
};
