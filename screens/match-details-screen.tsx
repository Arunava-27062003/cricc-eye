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
import { useMatchInfoQuery, useMatchSquadQuery } from '@/hooks/use-cricket-data';
import { formatDateLine, formatMatchType, formatScore, getTeamVisual } from '@/services/formatters';
import { useSavedStore } from '@/store/saved-store';

export function MatchDetailsScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const matchQuery = useMatchInfoQuery(id);
  const squadQuery = useMatchSquadQuery(id);
  const { toggleSaved, isSaved } = useSavedStore();

  const matchResult = matchQuery.data;
  const squadResult = squadQuery.data;
  const match = matchResult?.data;

  if (!match && matchQuery.isLoading) {
    return (
      <Page>
        <EmptyState title="Loading match" description="Pulling the latest scorecard and squad list." />
      </Page>
    );
  }

  if (!match) {
    return (
      <Page>
      <EmptyState title="Match unavailable" description="This match could not be loaded right now." />
      </Page>
    );
  }

  const firstTeam = getTeamVisual(match.teamInfo, match.teams[0] ?? 'Team A');
  const secondTeam = getTeamVisual(match.teamInfo, match.teams[1] ?? 'Team B');

  return (
    <Page
      refreshControlProps={{
        refreshing: matchQuery.isRefetching || squadQuery.isRefetching,
        onRefresh: () => {
          void matchQuery.refetch();
          void squadQuery.refetch();
        },
      }}>
      <PageSection style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backAction}>
            <Feather color={styles.back.color} name="arrow-left" size={16} />
            <Text style={styles.back}>Back</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              toggleSaved({
                id: match.id,
                type: 'match',
                title: match.name,
                subtitle: match.status,
                image: match.teamInfo?.[0]?.img,
                meta: match.matchType?.toUpperCase(),
              })
            }>
            <Text style={[styles.back, isSaved(match.id, 'match') && styles.saved]}>Save</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>{match.name}</Text>
        <Text style={styles.subtitle}>{`${formatMatchType(match.matchType)}  •  ${formatDateLine(match.date, match.dateTimeGMT)}`}</Text>

        <View style={styles.teamPanel}>
          <View style={styles.teamBlock}>
            <RemoteImage uri={firstTeam.image} label={firstTeam.shortName} size={56} />
            <Text style={styles.teamName}>{firstTeam.name}</Text>
            <Text style={styles.teamShort}>{firstTeam.shortName}</Text>
          </View>
          <View style={styles.vsBlock}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={styles.teamBlock}>
            <RemoteImage uri={secondTeam.image} label={secondTeam.shortName} size={56} />
            <Text style={styles.teamName}>{secondTeam.name}</Text>
            <Text style={styles.teamShort}>{secondTeam.shortName}</Text>
          </View>
        </View>

        <Text style={styles.score}>{formatScore(match.score)}</Text>
        <Text style={styles.status}>{match.status}</Text>
      </PageSection>

      {matchResult?.message ?? squadResult?.message ? (
        <PageSection>
          <DataSourceBanner message={matchResult?.message ?? squadResult?.message ?? ''} />
        </PageSection>
      ) : null}

      <PageSection>
        <SectionHeader title="Match center" />
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Venue</Text>
            <Text style={styles.infoValue}>{match.venue ?? 'TBD'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Toss</Text>
            <Text style={styles.infoValue}>{match.tossWinner ? `${match.tossWinner} chose ${match.tossChoice}` : 'Unavailable'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Winner</Text>
            <Text style={styles.infoValue}>{match.matchWinner ?? 'In progress'}</Text>
          </View>
        </View>
      </PageSection>

      <PageSection>
        <SectionHeader title="Squads" subtitle="Tap a player to open the profile view." />
        {(squadResult?.data ?? []).map((team) => (
          <View key={team.teamName} style={styles.squadCard}>
            <Text style={styles.squadTitle}>{team.teamName}</Text>
            <View style={styles.playersWrap}>
              {team.players.map((player) => (
                <Pressable
                  key={player.id}
                  onPress={() => router.push({ pathname: '/players/[id]', params: { id: player.id } })}
                  style={styles.playerChip}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerMeta}>{player.role ?? player.country ?? 'Player'}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </PageSection>
    </Page>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    headerCard: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.lg,
      gap: 14,
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
    back: {
      color: theme.textMuted,
      fontSize: 14,
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
    },
    teamPanel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    teamBlock: {
      flex: 1,
      alignItems: 'center',
      gap: 8,
    },
    teamName: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '800',
      textAlign: 'center',
    },
    teamShort: {
      color: theme.textSoft,
      fontSize: 12,
    },
    vsBlock: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 21,
      backgroundColor: theme.surfaceRaised,
    },
    vsText: {
      color: theme.primary,
      fontWeight: '900',
    },
    score: {
      color: theme.primary,
      fontSize: 16,
      fontWeight: '800',
    },
    status: {
      color: theme.text,
      fontSize: 14,
      lineHeight: 20,
    },
    infoGrid: {
      gap: 12,
    },
    infoCard: {
      gap: 6,
      padding: 16,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    infoLabel: {
      color: theme.textSoft,
      fontSize: 12,
      fontWeight: '700',
    },
    infoValue: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 21,
    },
    squadCard: {
      gap: 12,
      padding: 16,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    squadTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '800',
    },
    playersWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    playerChip: {
      width: '48%',
      gap: 4,
      borderRadius: theme.radius.md,
      backgroundColor: theme.surfaceRaised,
      padding: 12,
    },
    playerName: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '700',
    },
    playerMeta: {
      color: theme.textSoft,
      fontSize: 11,
    },
  });
