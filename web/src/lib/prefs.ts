// Per-browser UI preferences in localStorage. Keys used the "grokbot." prefix before the rename;
// those are still read as a fallback so existing settings carry over.
const PREFIX = 'teammates.';
const LEGACY_PREFIX = 'grokbot.';

export function prefGet(name: string): string | null {
  try { return localStorage.getItem(PREFIX + name) ?? localStorage.getItem(LEGACY_PREFIX + name); } catch { return null; }
}

export function prefSet(name: string, value: string) {
  try { localStorage.setItem(PREFIX + name, value); } catch { /* storage unavailable */ }
}
