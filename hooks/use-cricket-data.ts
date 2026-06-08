import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  getCurrentMatches,
  getMatchInfo,
  getMatchSquad,
  getPlayerInfo,
  getPlayers,
  getScoreFeed,
  getSeries,
  getSeriesInfo,
} from '@/services/cricket-api';

export function useCurrentMatchesQuery() {
  return useQuery({
    queryKey: ['current-matches'],
    queryFn: getCurrentMatches,
    staleTime: 10 * 60 * 1000,
  });
}

export function useScoreFeedQuery() {
  return useQuery({
    queryKey: ['score-feed'],
    queryFn: getScoreFeed,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSeriesQuery(search: string) {
  return useQuery({
    queryKey: ['series', search],
    queryFn: () => getSeries(search),
    placeholderData: keepPreviousData,
    staleTime: 12 * 60 * 60 * 1000,
  });
}

export function usePlayersQuery(search: string) {
  return useQuery({
    queryKey: ['players', search],
    queryFn: () => getPlayers(search),
    placeholderData: keepPreviousData,
    enabled: search.trim().length >= 2,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useMatchInfoQuery(id: string) {
  return useQuery({
    queryKey: ['match', id],
    queryFn: () => getMatchInfo(id),
    enabled: Boolean(id),
    staleTime: 10 * 60 * 1000,
  });
}

export function useMatchSquadQuery(id: string) {
  return useQuery({
    queryKey: ['match-squad', id],
    queryFn: () => getMatchSquad(id),
    enabled: Boolean(id),
    staleTime: 10 * 60 * 1000,
  });
}

export function useSeriesInfoQuery(id: string) {
  return useQuery({
    queryKey: ['series-info', id],
    queryFn: () => getSeriesInfo(id),
    enabled: Boolean(id),
    staleTime: 12 * 60 * 60 * 1000,
  });
}

export function usePlayerInfoQuery(id: string) {
  return useQuery({
    queryKey: ['player-info', id],
    queryFn: () => getPlayerInfo(id),
    enabled: Boolean(id),
    staleTime: 7 * 24 * 60 * 60 * 1000,
  });
}
