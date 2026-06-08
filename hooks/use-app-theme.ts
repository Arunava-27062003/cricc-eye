import { useMemo } from 'react';

import {
  darkAppTheme,
  lightAppTheme,
  navigationDarkTheme,
  navigationLightTheme,
  type AppTheme,
} from '@/constants/theme';
import { useThemeStore } from '@/store/theme-store';

export function useThemeMode() {
  return useThemeStore((state) => state.mode);
}

export function useAppTheme() {
  const mode = useThemeMode();
  return mode === 'light' ? lightAppTheme : darkAppTheme;
}

export function useNavigationTheme() {
  const mode = useThemeMode();
  return mode === 'light' ? navigationLightTheme : navigationDarkTheme;
}

export function useStatusBarStyle(): 'light' | 'dark' {
  const mode = useThemeMode();
  return mode === 'light' ? 'dark' : 'light';
}

export function useThemedStyles<T>(factory: (theme: AppTheme) => T) {
  const theme = useAppTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
