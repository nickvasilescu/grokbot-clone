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
  /** Origins allowed to send state-changing requests and open the screen relay (the web app and this server). */
  trustedOrigins: [...new Set([process.env.APP_URL ?? 'http://localhost:5173', serverUrl].map((u) => { try { return new URL(u).origin; } catch { return ''; } }).filter(Boolean))],
  /**
   * Who may create an account: comma-separated emails and/or @domains. Unset means anyone, but only
   * while SERVER_URL is a localhost URL; a public server with no list accepts no new sign-ups, because
   * every account spends the owner's xAI, Orgo and Composio credits.
   */
  allowedEmails: (process.env.ALLOWED_EMAILS ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
  openSignup: isLoopbackUrl(serverUrl),
  /** Mark cookies Secure when the server is reached over HTTPS. */
  secureCookies: serverUrl.startsWith('https://'),
  dbPath: process.env.DB_PATH ?? new URL('../../data/grokbot.db', import.meta.url).pathname,
};
