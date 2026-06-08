import { StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import type { AppTheme } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/use-app-theme';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.card}>
      <BrandMark size={40} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      gap: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      borderRadius: theme.radius.lg,
      padding: 24,
    },
    title: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '800',
    },
    description: {
      color: theme.textMuted,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
