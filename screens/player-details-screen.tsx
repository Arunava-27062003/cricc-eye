import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DataSourceBanner } from '@/components/data-source-banner';
import { EmptyState } from '@/components/empty-state';
import { Page, PageSection } from '@/components/page';
import { RemoteImage } from '@/components/remote-image';
import { SectionHeader } from '@/components/section-header';
import type { AppTheme } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/use-app-theme';
import { usePlayerInfoQuery } from '@/hooks/use-cricket-data';
import { useSavedStore } from '@/store/saved-store';
import type { PlayerStat } from '@/types/cricket';

function groupStats(stats: PlayerStat[]) {
  return stats.reduce<Record<string, Record<string, PlayerStat[]>>>((accumulator, stat) => {
    const fn = stat.fn.trim();
    const format = stat.matchtype.trim().toUpperCase();

    accumulator[fn] ??= {};
    accumulator[fn][format] ??= [];
    accumulator[fn][format].push(stat);

    return accumulator;
  }, {});
}

export function PlayerDetailsScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const playerQuery = usePlayerInfoQuery(id);
  const { toggleSaved, isSaved } = useSavedStore();
  const playerResult = playerQuery.data;
  const player = playerResult?.data;

  if (!player && playerQuery.isLoading) {
    return (
      <Page>
        <EmptyState title="Loading player" description="Fetching role, styles, and career splits." />
      </Page>
    );
  }

  if (!player) {
    return (
      <Page>
      <EmptyState title="Player unavailable" description="This player profile could not be loaded right now." />
      </Page>
    );
  }

  const stats = groupStats(player.stats ?? []);

  return (
    <Page
      refreshControlProps={{
        refreshing: playerQuery.isRefetching,
        onRefresh: () => void playerQuery.refetch(),
      }}>
      <PageSection style={styles.hero}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backAction}>
            <Feather color={styles.action.color} name="arrow-left" size={16} />
            <Text style={styles.action}>Back</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              toggleSaved({
                id: player.id,
                type: 'player',
                title: player.name,
                subtitle: player.country ?? 'Player profile',
                image: player.playerImg,
                meta: player.role,
              })
            }>
            <Text style={[styles.action, isSaved(player.id, 'player') && styles.saved]}>Save</Text>
          </Pressable>
        </View>

        <View style={styles.profile}>
          <RemoteImage uri={player.playerImg} label={player.name} size={74} />
          <View style={styles.profileCopy}>
            <Text style={styles.title}>{player.name}</Text>
            <Text style={styles.subtitle}>{player.role ?? 'Cricketer'}</Text>
            <Text style={styles.subtitle}>{player.country ?? 'Country unavailable'}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Batting</Text>
            <Text style={styles.metaValue}>{player.battingStyle ?? 'Unknown'}</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Bowling</Text>
            <Text style={styles.metaValue}>{player.bowlingStyle ?? 'Unknown'}</Text>
          </View>
        </View>
      </PageSection>

      {playerResult?.message ? (
        <PageSection>
          <DataSourceBanner message={playerResult.message} />
        </PageSection>
      ) : null}

      {Object.entries(stats).map(([fn, formats]) => (
        <PageSection key={fn}>
          <SectionHeader title={fn[0].toUpperCase() + fn.slice(1)} />
          {Object.entries(formats).map(([format, items]) => (
            <View key={`${fn}-${format}`} style={styles.statsCard}>
              <Text style={styles.formatTitle}>{format}</Text>
              <View style={styles.statsGrid}>
                {items.map((item) => (
                  <View key={`${format}-${item.stat}`} style={styles.statCell}>
                    <Text style={styles.statLabel}>{item.stat.trim()}</Text>
                    <Text style={styles.statValue}>{item.value.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </PageSection>
      ))}
    </Page>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    hero: {
      backgroundColor: theme.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.border,
      padding: theme.spacing.lg,
      gap: 16,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    action: {
      color: theme.textMuted,
      fontWeight: '700',
    },
    saved: {
      color: theme.primary,
    },
    profile: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    profileCopy: {
      flex: 1,
      gap: 4,
    },
    title: {
      color: theme.text,
      fontSize: 26,
      fontWeight: '900',
    },
    subtitle: {
      color: theme.textMuted,
      fontSize: 14,
    },
    metaRow: {
      gap: 12,
    },
    metaCard: {
      gap: 6,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.surfaceRaised,
      padding: 14,
    },
    metaLabel: {
      color: theme.textSoft,
      fontSize: 12,
      fontWeight: '700',
    },
    metaValue: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '700',
    },
    statsCard: {
      gap: 12,
      padding: 16,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    formatTitle: {
      color: theme.primary,
      fontSize: 14,
      fontWeight: '800',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    statCell: {
      width: '30%',
      minWidth: 88,
      gap: 4,
      borderRadius: theme.radius.md,
      backgroundColor: theme.surfaceRaised,
      padding: 10,
    },
    statLabel: {
      color: theme.textSoft,
      fontSize: 11,
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    statValue: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '800',
    },
  });
