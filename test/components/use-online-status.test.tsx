import { act, renderHook } from '@testing-library/react';

import { useOnlineStatus } from '../../src/components/common/useOnlineStatus';

function setNavigatorOnline(value: boolean) {
  Object.defineProperty(navigator, 'onLine', { value, configurable: true });
}

describe('useOnlineStatus', () => {
  afterEach(() => setNavigatorOnline(true));

  it('mirrors navigator.onLine on first render #unit', () => {
    setNavigatorOnline(true);
    expect(renderHook(() => useOnlineStatus()).result.current).toBe(true);

    setNavigatorOnline(false);
    expect(renderHook(() => useOnlineStatus()).result.current).toBe(false);
  });

  it('flips when the browser reports going offline and back #unit', () => {
    setNavigatorOnline(true);
    const { result } = renderHook(() => useOnlineStatus());

    setNavigatorOnline(false);
    act(() => window.dispatchEvent(new Event('offline')));
    expect(result.current).toBe(false);

    setNavigatorOnline(true);
    act(() => window.dispatchEvent(new Event('online')));
    expect(result.current).toBe(true);
  });
});
