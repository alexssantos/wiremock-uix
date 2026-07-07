/**
 * Typed LocalStorage helpers used for client-only UI state that never touches
 * the WireMock server (theme, favorites, sidebar collapse, persisted filters).
 */
export function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private browsing, quota exceeded) - fail silently.
  }
}
