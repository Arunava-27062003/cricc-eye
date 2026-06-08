import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { RefreshControlProps, StyleProp, ViewStyle } from 'react-native';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AppTheme } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/hooks/use-app-theme';

interface PageProps {
  children: ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControlProps?: RefreshControlProps;
}

export function Page({ children, scroll = true, contentContainerStyle, refreshControlProps }: PageProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets.bottom), [theme, insets.bottom]);

  if (!scroll) {
    return <SafeAreaView edges={['top']} style={styles.safeArea}>{children}</SafeAreaView>;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.content, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControlProps ? <RefreshControl tintColor={theme.primary} {...refreshControlProps} /> : undefined}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function PageSection({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const styles = useThemedStyles(createStyles);
  return <View style={[styles.section, style]}>{children}</View>;
}

const createStyles = (theme: AppTheme, bottomInset = 0) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: 112 + bottomInset,
      gap: theme.spacing.md,
    },
    section: {
      gap: theme.spacing.sm,
    },
  });
