/* eslint-disable @typescript-eslint/no-explicit-any */
import { createThemeStore } from '../../src/infra/theme';

// Helper to create a fake matchMedia

function createMatchMedia(initialMatches: boolean) {
  const map = new Map<string, any>();
  return (query: string) => {
    if (!map.has(query)) {
      const listeners: ((e: MediaQueryListEvent) => void)[] = [];
      const mq = {
        matches: initialMatches,
        media: query,
        addEventListener: (type: string, cb: (e: MediaQueryListEvent) => void) => {
          if (type === 'change') listeners.push(cb);
        },
        removeEventListener: (type: string, cb: (e: MediaQueryListEvent) => void) => {
          const idx = listeners.indexOf(cb);
          if (idx >= 0) listeners.splice(idx, 1);
        },
        dispatchChange(newMatches: boolean) {
          this.matches = newMatches;
          const event = { matches: newMatches, media: query } as MediaQueryListEvent;
          listeners.forEach((l) => l(event));
        },
      } as unknown as MediaQueryList;
      map.set(query, mq);
    }
    return map.get(query);
  };
}

describe('Theme store', () => {
  const STORAGE_KEY = 'raxa:theme';

  beforeEach(() => {
    // clear storage
    localStorage.clear();
    // reset document class
    document.documentElement.className = '';
  });

  test('#unit default follows system preference (light)', () => {
    const mm = createMatchMedia(false);
    const store = createThemeStore({ matchMedia: mm, storage: window.localStorage, doc: document });
    expect(store.getPreference()).toBe('system');
    expect(store.getSnapshot()).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('#unit default follows system preference (dark)', () => {
    const mm = createMatchMedia(true);
    const store = createThemeStore({ matchMedia: mm, storage: window.localStorage, doc: document });
    expect(store.getSnapshot()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('#unit setPreference persists and applies class', () => {
    const mm = createMatchMedia(false);
    const store = createThemeStore({ matchMedia: mm, storage: window.localStorage, doc: document });
    store.setPreference('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    expect(store.getPreference()).toBe('dark');
    expect(store.getSnapshot()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('#unit toggle flips mode and sets explicit preference', () => {
    const mm = createMatchMedia(false);
    const store = createThemeStore({ matchMedia: mm, storage: window.localStorage, doc: document });
    expect(store.getSnapshot()).toBe('light');
    store.toggle();
    expect(store.getPreference()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    store.toggle();
    expect(store.getPreference()).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('#unit subscriber notified on preference change and media change', () => {
    const mm = createMatchMedia(false) as any;
    const store = createThemeStore({ matchMedia: mm, storage: window.localStorage, doc: document });
    const fn = jest.fn();
    const unsub = store.subscribe(fn);
    store.setPreference('dark');
    expect(fn).toHaveBeenCalledTimes(1);
    // simulate media change while in system mode
    store.setPreference('system');
    fn.mockClear();
    mm('(prefers-color-scheme: dark)').dispatchChange(true);
    expect(fn).toHaveBeenCalledTimes(1);
    // change media again when explicit pref should not fire
    store.setPreference('light');
    fn.mockClear();
    mm('(prefers-color-scheme: dark)').dispatchChange(false);
    expect(fn).not.toHaveBeenCalled();
    unsub();
  });

  test('#unit corrupted storage falls back to system', () => {
    // simulate storage throwing on getItem
    const badStorage = {
      getItem: () => {
        throw new Error('boom');
      },
      setItem: () => {},
    } as unknown as Storage;
    const mm = createMatchMedia(true);
    const store = createThemeStore({ matchMedia: mm, storage: badStorage, doc: document });
    expect(store.getPreference()).toBe('system');
    expect(store.getSnapshot()).toBe('dark');
  });
});
