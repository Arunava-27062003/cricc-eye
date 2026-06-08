import { StyleSheet, Text, View } from 'react-native';

import type { AppTheme } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/use-app-theme';

export function DataSourceBanner({ message }: { message: string }) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>DEMO MODE</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      gap: 6,
      padding: 14,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    label: {
      color: theme.warning,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
    },
    message: {
      color: theme.textMuted,
      fontSize: 13,
      lineHeight: 19,
    },
  });
