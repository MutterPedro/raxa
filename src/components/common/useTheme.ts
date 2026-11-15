import { useSyncExternalStore } from 'react';
import { themeStore } from '../../infra/theme';

export function useTheme() {
  const theme = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot);
  return {
    theme,
    preference: themeStore.getPreference(),
    setPreference: themeStore.setPreference,
    toggle: themeStore.toggle,
  };
}
