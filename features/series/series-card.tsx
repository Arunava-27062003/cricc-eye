import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import type { AppTheme } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/use-app-theme';
import { formatSeriesBreakdown } from '@/services/formatters';
import type { SeriesSummary } from '@/types/cricket';

interface SeriesCardProps {
  series: SeriesSummary;
  index?: number;
  saved?: boolean;
  onPress: () => void;
  onToggleSave: () => void;
}

export function SeriesCard({ series, index = 0, saved = false, onPress, onToggleSave }: SeriesCardProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <Animated.View entering={FadeInDown.delay(index * 45).springify()} layout={LinearTransition.springify()}>
      <Pressable onPress={onPress} style={styles.card}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SERIES</Text>
          </View>
          <Pressable
            hitSlop={10}
            onPress={(event) => {
              event.stopPropagation();
              onToggleSave();
            }}>
            <Text style={[styles.saveText, saved && styles.savedText]}>{saved ? 'Saved' : 'Save'}</Text>
          </Pressable>
        </View>
        <Text style={styles.title}>{series.name}</Text>
        <Text style={styles.subtitle}>{formatSeriesBreakdown(series)}</Text>
        <View style={styles.footer}>
          <Text style={styles.date}>{series.startDate}</Text>
          <Text style={styles.date}>{series.endDate}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      gap: 12,
      padding: 16,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    badge: {
      backgroundColor: theme.mode === 'light' ? '#E8F2FB' : '#112B38',
      borderRadius: theme.radius.pill,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    badgeText: {
      color: theme.accent,
      fontSize: 11,
      fontWeight: '800',
    },
    saveText: {
      color: theme.textMuted,
      fontWeight: '700',
    },
    savedText: {
      color: theme.primary,
    },
    title: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '800',
    },
    subtitle: {
      color: theme.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    date: {
      color: theme.textSoft,
      fontSize: 13,
      fontWeight: '600',
    },
  });
