import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useWindowDimensions } from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import { DataSourceBanner } from '@/components/data-source-banner';
import { EmptyState } from '@/components/empty-state';
import { Page, PageSection } from '@/components/page';
import { SectionHeader } from '@/components/section-header';
import type { AppTheme } from '@/constants/theme';
import { MatchCard } from '@/features/matches/match-card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useCurrentMatchesQuery, useScoreFeedQuery } from '@/hooks/use-cricket-data';
import { formatShortDate, getFeedMatchTone, isLiveMatch } from '@/services/formatters';
import { useSavedStore } from '@/store/saved-store';
import type { MatchSummary } from '@/types/cricket';

function saveMatchPayload(match: MatchSummary) {
  return {
    id: match.id,
    type: 'match' as const,
    title: match.name,
    subtitle: match.status,
    image: match.teamInfo?.[0]?.img,
    meta: match.matchType?.toUpperCase(),
  };
}

export function HomeScreen() {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const styles = useMemo(() => createStyles(theme, isCompact), [theme, isCompact]);
  const router = useRouter();
  const matchesQuery = useCurrentMatchesQuery();
  const scoreFeedQuery = useScoreFeedQuery();
  const { toggleSaved, isSaved } = useSavedStore();

  const matchesResult = matchesQuery.data;
  const scoreFeedResult = scoreFeedQuery.data;
  const matches = matchesResult?.data ?? [];
  const liveMatches = matches.filter(isLiveMatch);
  const featuredMatches = (liveMatches.length ? liveMatches : matches).slice(0, 6);
  const fixtures = (scoreFeedResult?.data ?? []).slice(0, 8);
  const demoMessage = matchesResult?.message ?? scoreFeedResult?.message;

  return (
    <Page
      refreshControlProps={{
        refreshing: matchesQuery.isRefetching || scoreFeedQuery.isRefetching,
        onRefresh: () => {
          void matchesQuery.refetch();
          void scoreFeedQuery.refetch();
        },
      }}>
      <PageSection style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <Text style={styles.kicker}>CRICCBUZZ RN</Text>
            <Text style={styles.heroTitle}>Cleaner live scores. Dark-first by design.</Text>
            <Text style={styles.heroText}>
              Track current matches, upcoming fixtures, and saved cards without the clutter.
            </Text>
          </View>
          <BrandMark size={56} />
        </View>

        <View style={styles.metrics}>
          <View style={[styles.metricCard, isCompact && styles.metricCardCompact]}>
            <Text style={styles.metricValue}>{liveMatches.length}</Text>
            <Text numberOfLines={1} style={styles.metricLabel}>
              Live now
            </Text>
          </View>
          <View style={[styles.metricCard, isCompact && styles.metricCardCompact]}>
            <Text style={styles.metricValue}>{fixtures.length}</Text>
            <Text numberOfLines={1} style={styles.metricLabel}>
              Upcoming
            </Text>
          </View>
          <View style={[styles.metricCard, isCompact && styles.metricCardCompact]}>
            <Text style={styles.metricValue}>{matches.length}</Text>
            <Text numberOfLines={1} style={styles.metricLabel}>
              On radar
            </Text>
          </View>
        </View>
      </PageSection>

      {demoMessage ? (
        <PageSection>
          <DataSourceBanner message={demoMessage} />
        </PageSection>
      ) : null}

      <PageSection>
        <SectionHeader
          title="Quick scoreboard"
          subtitle="A quick look at the next set of fixtures."
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fixtureStrip}>
          {fixtures.map((item) => (
            <View key={item.id} style={styles.fixtureCard}>
              <Text style={styles.fixtureTone}>{getFeedMatchTone(item)}</Text>
              <Text style={styles.fixtureTeams}>{`${item.t1} vs ${item.t2}`}</Text>
              <Text style={styles.fixtureSeries}>{item.series}</Text>
              <Text style={styles.fixtureMeta}>{formatShortDate(item.dateTimeGMT)}</Text>
              <Text style={styles.fixtureStatus}>{item.status}</Text>
            </View>
          ))}
        </ScrollView>
      </PageSection>

      <PageSection>
        <SectionHeader
          title={liveMatches.length ? 'Live and latest' : 'Matches in focus'}
          subtitle="Follow the matches worth watching right now."
        />
        {featuredMatches.length ? (
          featuredMatches.map((match, index) => (
            <MatchCard
              key={match.id}
              match={match}
              index={index}
              saved={isSaved(match.id, 'match')}
              onPress={() => router.push({ pathname: '/matches/[id]', params: { id: match.id } })}
              onToggleSave={() => toggleSaved(saveMatchPayload(match))}
            />
          ))
        ) : (
          <EmptyState title="No matches right now" description="Pull to refresh and check again in a moment." />
        )}
      </PageSection>
    </Page>
  );
}

const createStyles = (theme: AppTheme, isCompact: boolean) =>
  StyleSheet.create({
    hero: {
      backgroundColor: theme.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.border,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    heroTop: {
      flexDirection: 'row',
      gap: 16,
    },
    heroCopy: {
      flex: 1,
      gap: 10,
    },
    kicker: {
      color: theme.primary,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1.3,
    },
    heroTitle: {
      color: theme.text,
      fontSize: 30,
      fontWeight: '900',
      lineHeight: 36,
    },
    heroText: {
      color: theme.textMuted,
      fontSize: 14,
      lineHeight: 21,
    },
    metrics: {
      flexDirection: 'row',
      gap: 12,
    },
    metricCard: {
      flex: 1,
      minWidth: 0,
      backgroundColor: theme.surfaceRaised,
      borderRadius: theme.radius.lg,
      padding: isCompact ? 12 : 14,
      gap: 6,
      alignItems: 'flex-start',
      justifyContent: 'center',
      minHeight: isCompact ? 88 : 96,
    },
    metricCardCompact: {
      flexBasis: 0,
    },
    metricValue: {
      color: theme.text,
      fontSize: isCompact ? 22 : 24,
      fontWeight: '900',
    },
    metricLabel: {
      color: theme.textMuted,
      fontSize: isCompact ? 11 : 12,
      fontWeight: '600',
    },
    fixtureStrip: {
      gap: 12,
      paddingRight: 4,
    },
    fixtureCard: {
      width: 240,
      gap: 8,
      padding: 16,
      backgroundColor: theme.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.border,
    },
    fixtureTone: {
      color: theme.accent,
      fontSize: 11,
      fontWeight: '800',
    },
    fixtureTeams: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '800',
    },
    fixtureSeries: {
      color: theme.textMuted,
      fontSize: 13,
    },
    fixtureMeta: {
      color: theme.primary,
      fontSize: 12,
      fontWeight: '700',
    },
    fixtureStatus: {
      color: theme.textSoft,
      fontSize: 12,
      lineHeight: 18,
    },
  });
