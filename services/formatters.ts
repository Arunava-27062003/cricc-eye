import type { MatchScore, MatchSummary, ScoreFeedItem, SeriesSummary, TeamInfo } from '@/types/cricket';

export function formatMatchType(matchType?: string) {
  if (!matchType) {
    return 'Match';
  }

  return matchType.toUpperCase();
}

export function formatShortDate(dateTime?: string) {
  if (!dateTime) {
    return 'TBD';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateTime));
}

export function formatDateLine(date?: string, dateTime?: string) {
  return formatShortDate(dateTime ?? date);
}

export function formatScore(score?: MatchScore[]) {
  if (!score?.length) {
    return 'No innings data yet';
  }

  return score
    .map((innings) => `${innings.r}/${innings.w} (${innings.o})`)
    .join('  •  ');
}

export function getTeamVisual(teamInfo: TeamInfo[] | undefined, teamName: string, fallback?: string) {
  const match = teamInfo?.find((item) => item.name.toLowerCase() === teamName.toLowerCase());

  return {
    name: match?.name ?? teamName,
    shortName: match?.shortname ?? fallback ?? teamName.slice(0, 3).toUpperCase(),
    image: match?.img,
  };
}

export function getMatchTone(match: MatchSummary) {
  if (match.matchStarted && !match.matchEnded) {
    return 'LIVE';
  }

  if (match.matchEnded) {
    return 'RESULT';
  }

  return 'UPCOMING';
}

export function isLiveMatch(match: MatchSummary) {
  return Boolean(match.matchStarted && !match.matchEnded);
}

export function getFeedMatchTone(item: ScoreFeedItem) {
  if (item.ms === 'live') {
    return 'LIVE';
  }

  if (item.ms === 'result') {
    return 'RESULT';
  }

  return 'FIXTURE';
}

export function formatSeriesBreakdown(series: Pick<SeriesSummary, 'odi' | 't20' | 'test' | 'matches'>) {
  const parts = [
    series.t20 ? `${series.t20} T20` : null,
    series.odi ? `${series.odi} ODI` : null,
    series.test ? `${series.test} Test` : null,
  ].filter(Boolean);

  return parts.length ? `${parts.join(' • ')}  •  ${series.matches} matches` : `${series.matches} matches`;
}

export function slugifyIdTitle(title: string) {
  return title.replace(/\s+/g, ' ').trim();
}
