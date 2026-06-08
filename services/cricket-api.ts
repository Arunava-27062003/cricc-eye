import type {
  ApiResponse,
  DataEnvelope,
  MatchSummary,
  PlayerInfo,
  PlayerSummary,
  ScoreFeedItem,
  SeriesInfoResponse,
  SeriesSummary,
  SquadTeam,
} from '@/types/cricket';
import {
  getDemoCurrentMatches,
  getDemoMatchInfo,
  getDemoMatchSquad,
  getDemoPlayerInfo,
  getDemoPlayers,
  getDemoScoreFeed,
  getDemoSeries,
  getDemoSeriesInfo,
} from '@/services/demo-data';
import { backendClient, hasConfiguredBackendUrl } from '@/services/backend-api';

const DEMO_MESSAGE_NO_KEY = 'Showing sample scores for now.';
const DEMO_MESSAGE_LIMIT = 'Live updates are temporarily unavailable, so sample scores are being shown.';

async function request<T>(
  url: string,
  fallback: () => T,
  params?: Record<string, string | number | undefined>
): Promise<DataEnvelope<T>> {
  if (!hasConfiguredBackendUrl) {
    return {
      data: fallback(),
      source: 'demo',
      message: DEMO_MESSAGE_NO_KEY,
    };
  }

  try {
    const response = await backendClient.get<ApiResponse<T>>(url, { params });

    if (response.data.status !== 'success' || response.data.data == null) {
      throw new Error(`Backend cricket request failed for ${url} with status ${response.data.status}`);
    }

    return {
      data: response.data.data,
      source: 'live',
    };
  } catch (error) {
    console.warn(`Falling back to demo data for ${url}`, error);

    return {
      data: fallback(),
      source: 'demo',
      message: DEMO_MESSAGE_LIMIT,
    };
  }
}

export function getCurrentMatches() {
  return request<MatchSummary[]>('/api/cricket/current-matches', getDemoCurrentMatches, { offset: 0 });
}

export function getScoreFeed() {
  return request<ScoreFeedItem[]>('/api/cricket/score-feed', getDemoScoreFeed);
}

export function getSeries(search?: string) {
  return request<SeriesSummary[]>('/api/cricket/series', () => getDemoSeries(search), {
    offset: 0,
    search: search?.trim() || undefined,
  });
}

export function getSeriesInfo(id: string) {
  return request<SeriesInfoResponse>(`/api/cricket/series/${id}`, () => getDemoSeriesInfo(id));
}

export function getPlayers(search?: string) {
  return request<PlayerSummary[]>('/api/cricket/players', () => getDemoPlayers(search), {
    offset: 0,
    search: search?.trim() || undefined,
  });
}

export function getPlayerInfo(id: string) {
  return request<PlayerInfo>(`/api/cricket/players/${id}`, () => getDemoPlayerInfo(id));
}

export function getMatchInfo(id: string) {
  return request<MatchSummary>(`/api/cricket/matches/${id}`, () => getDemoMatchInfo(id));
}

export function getMatchSquad(id: string) {
  return request<SquadTeam[]>(`/api/cricket/matches/${id}/squad`, () => getDemoMatchSquad(id));
}
