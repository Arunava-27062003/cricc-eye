import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark';

const themeShape = {
  radius: {
    xl: 28,
    lg: 22,
    md: 16,
    sm: 12,
    pill: 999,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 28,
  },
} as const;

const darkPalette = {
  background: '#06121B',
  surface: '#0D1B25',
  surfaceRaised: '#122534',
  surfaceMuted: '#173243',
  border: '#24475D',
  primary: '#2BE4A3',
  primaryMuted: '#123A31',
  accent: '#5CC8FF',
  danger: '#FF7B7B',
  warning: '#FFC857',
  text: '#F4F7FB',
  textMuted: '#9CB3C4',
  textSoft: '#6E8798',
} as const;

const lightPalette = {
  background: '#F4F8FC',
  surface: '#FFFFFF',
  surfaceRaised: '#F2F7FB',
  surfaceMuted: '#E4EEF6',
  border: '#D2DFEA',
  primary: '#0E8C73',
  primaryMuted: '#D7F4EC',
  accent: '#1E88E5',
  danger: '#D84C4C',
  warning: '#B7791F',
  text: '#15222E',
  textMuted: '#546576',
  textSoft: '#73879A',
} as const;

export interface AppTheme {
  mode: ThemeMode;
  background: string;
  surface: string;
  surfaceRaised: string;
  surfaceMuted: string;
  border: string;
  primary: string;
  primaryMuted: string;
  accent: string;
  danger: string;
  warning: string;
  text: string;
  textMuted: string;
  textSoft: string;
  radius: typeof themeShape.radius;
  spacing: typeof themeShape.spacing;
}

export const lightAppTheme: AppTheme = {
  mode: 'light',
  ...lightPalette,
  ...themeShape,
};

export const darkAppTheme: AppTheme = {
  mode: 'dark',
  ...darkPalette,
  ...themeShape,
};

export const Colors = {
  light: {
    text: lightAppTheme.text,
    background: lightAppTheme.background,
    tint: lightAppTheme.primary,
    icon: lightAppTheme.textMuted,
    tabIconDefault: lightAppTheme.textSoft,
    tabIconSelected: lightAppTheme.primary,
  },
  dark: {
    text: darkAppTheme.text,
    background: darkAppTheme.background,
    tint: darkAppTheme.primary,
    icon: darkAppTheme.textMuted,
    tabIconDefault: darkAppTheme.textSoft,
    tabIconSelected: darkAppTheme.primary,
  },
};

export const navigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightAppTheme.primary,
    background: lightAppTheme.background,
    card: lightAppTheme.surface,
    text: lightAppTheme.text,
    border: lightAppTheme.border,
    notification: lightAppTheme.accent,
  },
};

export const navigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: darkAppTheme.primary,
    background: darkAppTheme.background,
    card: darkAppTheme.surface,
    text: darkAppTheme.text,
    border: darkAppTheme.border,
    notification: darkAppTheme.accent,
  },
};

export const appTheme = darkAppTheme;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const cardShadow = {
  shadowColor: '#000000',
  shadowOpacity: 0.25,
  shadowOffset: { width: 0, height: 12 },
  shadowRadius: 20,
  elevation: 8,
};
