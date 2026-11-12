export type ThemePreference = 'light' | 'dark' | 'system';
export type ThemeMode = 'light' | 'dark';

interface Deps {
  storage?: Storage;
  matchMedia?: (query: string) => MediaQueryList;
  doc?: Document;
}

interface ThemeStore {
  getSnapshot(): ThemeMode;
  getPreference(): ThemePreference;
  setPreference(p: ThemePreference): void;
  toggle(): void;
  subscribe(cb: () => void): () => void;
}

function applyMode(mode: ThemeMode, doc: Document) {
  const root = doc.documentElement;
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function createThemeStore(deps: Deps = {}): ThemeStore {
  const storage = deps.storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  const matchMedia =
    deps.matchMedia ??
    (typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? (query: string) => window.matchMedia(query)
      : undefined);
  const doc = deps.doc ?? (typeof document !== 'undefined' ? document : undefined);

  const listeners = new Set<() => void>();

  const readPreference = (): ThemePreference => {
    try {
      const stored = storage?.getItem('raxa:theme');
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored as ThemePreference;
      }
    } catch {
      /* ignore */
    }
    return 'system';
  };

  const mediaQuery = matchMedia?.('(prefers-color-scheme: dark)');

  const resolveMode = (pref: ThemePreference): ThemeMode => {
    if (pref === 'light') return 'light';
    if (pref === 'dark') return 'dark';
    // system
    try {
      return mediaQuery?.matches ? 'dark' : 'light';
    } catch {
      /* ignore */
    }
    return 'light';
  };

  let preference: ThemePreference = readPreference();
  let mode: ThemeMode = resolveMode(preference);

  const notify = () => listeners.forEach((cb) => cb());

  const setPreference = (p: ThemePreference) => {
    preference = p;
    try {
      storage?.setItem('raxa:theme', p);
    } catch {
      /* ignore */
    }
    mode = resolveMode(preference);
    if (doc) applyMode(mode, doc);
    notify();
  };

  const toggle = () => {
    const newMode: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    // Explicitly set preference to opposite of current resolved mode
    setPreference(newMode);
  };

  const getSnapshot = () => mode;
  const getPreference = () => preference;

  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    // media change listener for system preference
    const handler = () => {
      if (preference === 'system') {
        mode = resolveMode('system');
        if (doc) applyMode(mode, doc);
        notify();
      }
    };
    mediaQuery?.addEventListener('change', handler);
    return () => {
      listeners.delete(cb);
      mediaQuery?.removeEventListener('change', handler);
    };
  };

  // initial apply
  if (doc) applyMode(mode, doc);

  return { getSnapshot, getPreference, setPreference, toggle, subscribe };
}

// Singleton store for app runtime
export const themeStore = createThemeStore();
