import { act, renderHook, cleanup } from '@testing-library/react';

import { useReducedMotion } from '../../src/components/common/useReducedMotion';

type ChangeListener = () => void;

const QUERY = '(prefers-reduced-motion: reduce)';

let listeners: ChangeListener[] = [];
let mediaMatches = false;

function mockMatchMedia(matches: boolean) {
  mediaMatches = matches;
  listeners = [];
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches: query === QUERY ? mediaMatches : false,
      media: query,
      addEventListener: (_type: string, cb: ChangeListener) => listeners.push(cb),
      removeEventListener: (_type: string, cb: ChangeListener) => {
        listeners = listeners.filter((l) => l !== cb);
      },
    }),
  });
}

describe('useReducedMotion', () => {
  afterEach(() => {
    cleanup();
    delete (window as Partial<Window> & { matchMedia?: unknown }).matchMedia;
  });

  it('mirrors the prefers-reduced-motion media query #unit', () => {
    mockMatchMedia(false);
    expect(renderHook(() => useReducedMotion()).result.current).toBe(false);

    mockMatchMedia(true);
    expect(renderHook(() => useReducedMotion()).result.current).toBe(true);
  });

  it('flips when the OS preference changes #unit', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    mediaMatches = true;
    act(() => {
      listeners.forEach((cb) => cb());
    });
    expect(result.current).toBe(true);

    mediaMatches = false;
    act(() => {
      listeners.forEach((cb) => cb());
    });
    expect(result.current).toBe(false);
  });

  it('treats environments without matchMedia as reduced motion #unit', () => {
    // jsdom ships no window.matchMedia; the safe fallback is "no animation".
    expect(window.matchMedia).toBeUndefined();
    expect(renderHook(() => useReducedMotion()).result.current).toBe(true);
  });
});
