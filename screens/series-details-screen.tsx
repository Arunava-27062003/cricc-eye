import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DataSourceBanner } from '@/components/data-source-banner';
import { EmptyState } from '@/components/empty-state';
import { Page, PageSection } from '@/components/page';
import { SectionHeader } from '@/components/section-header';
import type { AppTheme } from '@/constants/theme';
import { MatchCard } from '@/features/matches/match-card';
import { useThemedStyles } from '@/hooks/use-app-theme';
import { useSeriesInfoQuery } from '@/hooks/use-cricket-data';
import { formatSeriesBreakdown } from '@/services/formatters';
import { useSavedStore } from '@/store/saved-store';

export function SeriesDetailsScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const seriesQuery = useSeriesInfoQuery(id);
  const { toggleSaved, isSaved } = useSavedStore();

  const seriesResult = seriesQuery.data;
  const series = seriesResult?.data;

  if (!series && seriesQuery.isLoading) {
    return (
      <Page>
        <EmptyState title="Loading series" description="Building the match list and series summary." />
      </Page>
    );
  }

  if (!series) {
    return (
      <Page>
      <EmptyState title="Series unavailable" description="This series could not be loaded right now." />
      </Page>
    );
  }

  return (
    <Page
      refreshControlProps={{
        refreshing: seriesQuery.isRefetching,
        onRefresh: () => void seriesQuery.refetch(),
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
                id: series.info.id,
                type: 'series',
                title: series.info.name,
                subtitle: formatSeriesBreakdown({
                  matches: series.info.matches,
                  t20: series.info.t20,
                  odi: series.info.odi,
                  test: series.info.test,
                }),
                meta: `${series.info.startdate} - ${series.info.enddate}`,
              })
            }>
            <Text style={[styles.action, isSaved(series.info.id, 'series') && styles.saved]}>Save</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>{series.info.name}</Text>
        <Text style={styles.subtitle}>
          {formatSeriesBreakdown({
            matches: series.info.matches,
            odi: series.info.odi,
            t20: series.info.t20,
            test: series.info.test,
          })}
        </Text>
        <Text style={styles.subtitle}>{`${series.info.startdate} - ${series.info.enddate}`}</Text>
      </PageSection>

      {seriesResult?.message ? (
        <PageSection>
          <DataSourceBanner message={seriesResult.message} />
        </PageSection>
      ) : null}

      <PageSection>
        <SectionHeader title="Matches" subtitle={`${series.matchList.length} fixtures in this series`} />
        {series.matchList.map((match, index) => (
          <MatchCard
            key={match.id}
            match={match}
            index={index}
            saved={isSaved(match.id, 'match')}
            onPress={() => router.push({ pathname: '/matches/[id]', params: { id: match.id } })}
            onToggleSave={() =>
              toggleSaved({
                id: match.id,
                type: 'match',
                title: match.name,
                subtitle: match.status,
                image: match.teamInfo?.[0]?.img,
                meta: match.matchType?.toUpperCase(),
              })
            }
          />
        ))}
      </PageSection>
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
      gap: 10,
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
    title: {
      color: theme.text,
      fontSize: 26,
      fontWeight: '900',
      lineHeight: 32,
    },
    subtitle: {
      color: theme.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
  });
