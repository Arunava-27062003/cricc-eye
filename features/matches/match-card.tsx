import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { RemoteImage } from '@/components/remote-image';
import type { AppTheme } from '@/constants/theme';
import { cardShadow } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/use-app-theme';
import { formatDateLine, formatMatchType, formatScore, getMatchTone, getTeamVisual } from '@/services/formatters';
import type { MatchSummary } from '@/types/cricket';

interface MatchCardProps {
  match: MatchSummary;
  index?: number;
  saved?: boolean;
  onPress: () => void;
  onToggleSave: () => void;
}

export function MatchCard({ match, index = 0, saved = false, onPress, onToggleSave }: MatchCardProps) {
  const styles = useThemedStyles(createStyles);
  const firstTeam = getTeamVisual(match.teamInfo, match.teams[0] ?? 'Team A');
  const secondTeam = getTeamVisual(match.teamInfo, match.teams[1] ?? 'Team B');
  const tone = getMatchTone(match);

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()} layout={LinearTransition.springify()} style={styles.wrapper}>
      <Pressable onPress={onPress} style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.badge, tone === 'LIVE' ? styles.liveBadge : tone === 'RESULT' ? styles.resultBadge : styles.fixtureBadge]}>
            <Text style={styles.badgeText}>{tone}</Text>
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

        <Text style={styles.title}>{match.name}</Text>
        <Text style={styles.meta}>{`${formatMatchType(match.matchType)}  •  ${formatDateLine(match.date, match.dateTimeGMT)}`}</Text>

        <View style={styles.teams}>
          <View style={styles.teamRow}>
            <RemoteImage uri={firstTeam.image} label={firstTeam.shortName} />
            <View style={styles.teamCopy}>
              <Text style={styles.teamName}>{firstTeam.name}</Text>
              <Text style={styles.teamCode}>{firstTeam.shortName}</Text>
            </View>
          </View>
          <View style={styles.teamRow}>
            <RemoteImage uri={secondTeam.image} label={secondTeam.shortName} />
            <View style={styles.teamCopy}>
              <Text style={styles.teamName}>{secondTeam.name}</Text>
              <Text style={styles.teamCode}>{secondTeam.shortName}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.score}>{formatScore(match.score)}</Text>
        <Text style={styles.status}>{match.status}</Text>
        <Text style={styles.venue}>{match.venue ?? 'Venue TBD'}</Text>
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      borderRadius: theme.radius.lg,
    },
    card: {
      gap: 12,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      ...cardShadow,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: theme.radius.pill,
    },
    liveBadge: {
      backgroundColor: theme.primaryMuted,
    },
    resultBadge: {
      backgroundColor: theme.mode === 'light' ? '#F8E8DF' : '#302622',
    },
    fixtureBadge: {
      backgroundColor: theme.mode === 'light' ? '#E6F0FA' : '#122A3C',
    },
    badgeText: {
      color: theme.text,
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
      lineHeight: 24,
    },
    meta: {
      color: theme.textSoft,
      fontSize: 13,
    },
    teams: {
      gap: 10,
    },
    teamRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    teamCopy: {
      flex: 1,
    },
    teamName: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '700',
    },
    teamCode: {
      color: theme.textSoft,
      fontSize: 12,
      marginTop: 2,
    },
    score: {
      color: theme.primary,
      fontSize: 15,
      fontWeight: '700',
    },
    status: {
      color: theme.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
    venue: {
      color: theme.textSoft,
      fontSize: 12,
    },
  });
