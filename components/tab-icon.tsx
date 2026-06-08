import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { AppTheme } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/hooks/use-app-theme';

interface TabIconProps {
  focused: boolean;
  label: string;
  variant: 'live' | 'series' | 'search' | 'saved' | 'profile';
}

function IconGlyph({ focused, theme, variant }: Pick<TabIconProps, 'focused' | 'variant'> & { theme: AppTheme }) {
  const color = focused ? theme.primary : theme.textSoft;

  if (variant === 'live') {
    return (
      <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
        <Rect x="2" y="4" width="18" height="14" rx="4" stroke={color} strokeWidth="2" />
        <Path d="M6 14h2.5l1.5-5 2 7 1.5-4H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  if (variant === 'series') {
    return (
      <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
        <Path d="M11 3 5 6v5c0 4.5 2.8 6.9 6 8 3.2-1.1 6-3.5 6-8V6l-6-3Z" stroke={color} strokeWidth="2" />
        <Path d="m8.5 11.5 1.7 1.7 3.8-4.2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  if (variant === 'search') {
    return (
      <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
        <Circle cx="10" cy="10" r="6" stroke={color} strokeWidth="2" />
        <Path d="m15 15 4 4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </Svg>
    );
  }

  if (variant === 'profile') {
    return (
      <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
        <Circle cx="11" cy="7.5" r="3.5" stroke={color} strokeWidth="2" />
        <Path d="M4.5 18c1.7-3 4-4.5 6.5-4.5s4.8 1.5 6.5 4.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </Svg>
    );
  }

  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path d="M6 4h10a2 2 0 0 1 2 2v12l-7-4-7 4V6a2 2 0 0 1 2-2Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </Svg>
  );
}

export function TabIcon({ focused, label, variant }: TabIconProps) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, { duration: 180 });
  }, [focused, progress]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.96 + progress.value * 0.04 }],
    backgroundColor: progress.value > 0 ? theme.primaryMuted : 'transparent',
    paddingHorizontal: 10 + progress.value * 4,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    maxWidth: 52 * progress.value,
    marginLeft: progress.value > 0 ? 6 : 0,
  }));

  return (
    <Animated.View style={[styles.container, focused ? styles.containerFocused : styles.containerIdle, containerStyle]}>
      <View style={styles.iconWrapper}>
        <IconGlyph focused={focused} theme={theme} variant={variant} />
      </View>
      <Animated.View style={[styles.labelWrap, labelStyle]}>
        <Text numberOfLines={1} style={[styles.label, focused && styles.labelActive]}>
          {label}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      borderRadius: theme.radius.pill,
      minWidth: 42,
      height: 42,
      overflow: 'hidden',
    },
    containerFocused: {
      minWidth: 86,
    },
    containerIdle: {
      minWidth: 42,
    },
    iconWrapper: {
      width: 22,
      height: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    labelWrap: {
      overflow: 'hidden',
    },
    label: {
      color: theme.textMuted,
      fontSize: 12,
      fontWeight: '700',
    },
    labelActive: {
      color: theme.primary,
    },
  });
