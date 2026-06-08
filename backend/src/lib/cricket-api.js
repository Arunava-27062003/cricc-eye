const { env } = require('../config/env');
const {
  getDemoCurrentMatches,
  getDemoMatchInfo,
  getDemoMatchSquad,
  getDemoPlayerInfo,
  getDemoPlayers,
  getDemoScoreFeed,
  getDemoSeries,
  getDemoSeriesInfo,
} = require('./demo-data');
const { peek, remember } = require('./request-cache');

const RAPIDAPI_BASE_URL = `https://${env.RAPIDAPI_HOST}`;
const DEMO_MESSAGE = 'Live updates are temporarily unavailable, so sample scores are being shown.';
const HOME_CACHE_TTL_MS = 15 * 60 * 1000;
const SERIES_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const PLAYER_SEARCH_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const PLAYER_DETAIL_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MATCH_DETAIL_CACHE_TTL_MS = 15 * 60 * 1000;
const SERIES_CATEGORIES = ['international', 'league', 'domestic', 'women'];
const PLAYER_SEARCH_PATHS = ['/stats/v1/player/search', '/players/v1/search'];

function createDemoPayload(data) {
  return {
    status: 'success',
    data,
    source: 'demo',
    message: DEMO_MESSAGE,
  };
}

function createLivePayload(data) {
  return {
    status: 'success',
    data,
    source: 'live',
  };
}

function hasRapidApiConfig() {
  return Boolean(env.RAPIDAPI_KEY && env.RAPIDAPI_KEY !== 'your-rapidapi-key');
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function encodeParams(params = {}) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

async function fetchRapidApiJson(path, params = {}) {
  const response = await fetch(`${RAPIDAPI_BASE_URL}${path}${encodeParams(params)}`, {
    headers: {
      'x-rapidapi-key': env.RAPIDAPI_KEY,
      'x-rapidapi-host': env.RAPIDAPI_HOST,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`RapidAPI request failed for ${path} with status ${response.status}`);
  }

  return response.json();
}

function slug(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function parseTimestamp(value) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string') {
    const numeric = Number(value);

    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric;
    }

    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function toIsoDateTime(value) {
  const timestamp = parseTimestamp(value);
  return timestamp ? new Date(timestamp).toISOString() : undefined;
}

function toIsoDate(value) {
  const dateTime = toIsoDateTime(value);
  return dateTime ? dateTime.slice(0, 10) : undefined;
}

function normalizeMatchType(value) {
  const normalized = slug(value);

  if (normalized.includes('test')) {
    return 'test';
  }

  if (normalized.includes('odi') || normalized.includes('one-day')) {
    return 'odi';
  }

  if (normalized.includes('t20')) {
    return 't20';
  }

  if (normalized.includes('t10')) {
    return 't10';
  }

  return normalized || 'match';
}

function getLifecycle(state, complete) {
  const normalizedState = slug(state);
  const matchEnded =
    Boolean(complete) ||
    normalizedState.includes('complete') ||
    normalizedState.includes('result') ||
    normalizedState.includes('abandon') ||
    normalizedState.includes('cancel');
  const matchStarted =
    matchEnded ||
    !(
      normalizedState.includes('preview') ||
      normalizedState.includes('upcoming') ||
      normalizedState.includes('not started')
    );

  return { matchStarted, matchEnded };
}

function mapTeamInfo(name, shortname, imageId) {
  return {
    name: name ?? 'Team',
    shortname: shortname ?? String(name ?? 'T').slice(0, 3).toUpperCase(),
    img: imageId ? `https://img1.cricbuzz.com/a/img/v1/i1/c${imageId}/i.jpg` : undefined,
  };
}

function buildPlayerImageUrl(faceImageId, imageUrl) {
  if (typeof imageUrl === 'string' && imageUrl.trim()) {
    return imageUrl;
  }

  if (faceImageId === undefined || faceImageId === null || faceImageId === '') {
    return undefined;
  }

  return `https://img1.cricbuzz.com/img/faceImages/${faceImageId}.jpg`;
}

function mapInnings(teamName, teamScore = {}) {
  return Object.entries(teamScore)
    .filter(([key, value]) => key.startsWith('inngs') && value)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, innings]) => ({
      r: Number(innings.runs ?? 0),
      w: Number(innings.wickets ?? 0),
      o: Number(innings.overs ?? 0),
      inning: `${teamName} Inning ${key.replace('inngs', '') || '1'}`,
    }));
}

function formatFeedScore(teamScore = {}) {
  const innings = Object.entries(teamScore)
    .filter(([key, value]) => key.startsWith('inngs') && value)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([, innings]) => {
      const runs = innings.runs ?? '-';
      const wickets = innings.wickets ?? 0;
      return `${runs}/${wickets}`;
    });

  return innings.length ? innings.join(' & ') : undefined;
}

function mapVenue(venueInfo = {}) {
  return [venueInfo.ground, venueInfo.city].filter(Boolean).join(', ') || undefined;
}

function mapMatchSummaryFromList(matchInfo = {}, matchScore = {}) {
  const team1 = matchInfo.team1 ?? {};
  const team2 = matchInfo.team2 ?? {};
  const lifecycle = getLifecycle(matchInfo.stateTitle ?? matchInfo.state, false);

  return {
    id: String(matchInfo.matchId),
    name: `${team1.teamName ?? 'Team A'} vs ${team2.teamName ?? 'Team B'}, ${matchInfo.matchDesc ?? 'Match'}, ${matchInfo.seriesName ?? 'Series'}`,
    matchType: normalizeMatchType(matchInfo.matchFormat),
    status: matchInfo.status ?? matchInfo.state ?? 'Status unavailable',
    venue: mapVenue(matchInfo.venueInfo),
    date: toIsoDate(matchInfo.startDate),
    dateTimeGMT: toIsoDateTime(matchInfo.startDate),
    teams: [team1.teamName ?? 'Team A', team2.teamName ?? 'Team B'],
    teamInfo: [
      mapTeamInfo(team1.teamName, team1.teamSName, team1.imageId),
      mapTeamInfo(team2.teamName, team2.teamSName, team2.imageId),
    ],
    score: [...mapInnings(team1.teamName ?? 'Team A', matchScore.team1Score), ...mapInnings(team2.teamName ?? 'Team B', matchScore.team2Score)],
    series_id: matchInfo.seriesId ? String(matchInfo.seriesId) : undefined,
    fantasyEnabled: Boolean(matchInfo.isFantasyEnabled),
    hasSquad: true,
    matchStarted: lifecycle.matchStarted,
    matchEnded: lifecycle.matchEnded,
  };
}

function mapScoreFeedItem(matchInfo = {}, matchScore = {}) {
  const lifecycle = getLifecycle(matchInfo.stateTitle ?? matchInfo.state, false);
  const team1 = matchInfo.team1 ?? {};
  const team2 = matchInfo.team2 ?? {};

  return {
    id: String(matchInfo.matchId),
    dateTimeGMT: toIsoDateTime(matchInfo.startDate) ?? new Date().toISOString(),
    matchType: normalizeMatchType(matchInfo.matchFormat),
    status: matchInfo.status ?? matchInfo.state ?? 'Status unavailable',
    ms: lifecycle.matchEnded ? 'result' : lifecycle.matchStarted ? 'live' : 'fixture',
    t1: `${team1.teamName ?? 'Team A'} [${team1.teamSName ?? 'A'}]`,
    t2: `${team2.teamName ?? 'Team B'} [${team2.teamSName ?? 'B'}]`,
    t1s: formatFeedScore(matchScore.team1Score),
    t2s: formatFeedScore(matchScore.team2Score),
    t1img: team1.imageId ? mapTeamInfo(team1.teamName, team1.teamSName, team1.imageId).img : undefined,
    t2img: team2.imageId ? mapTeamInfo(team2.teamName, team2.teamSName, team2.imageId).img : undefined,
    series: matchInfo.seriesName ?? 'Series',
  };
}

function flattenMatchEntries(payload = {}) {
  return safeArray(payload.typeMatches).flatMap((typeBlock) =>
    safeArray(typeBlock?.seriesMatches).flatMap((seriesBlock) => {
      const wrapper = seriesBlock?.seriesAdWrapper;

      if (!wrapper) {
        return [];
      }

      return safeArray(wrapper.matches)
        .map((match) => ({
          matchInfo: match?.matchInfo,
          matchScore: match?.matchScore,
          seriesId: wrapper.seriesId,
          seriesName: wrapper.seriesName,
        }))
        .filter((entry) => entry.matchInfo?.matchId);
    })
  );
}

function dedupeById(items) {
  const seen = new Set();

  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

async function getHomeBundleLive() {
  return remember('rapidapi:home-bundle', HOME_CACHE_TTL_MS, async () => {
    const [livePayload, upcomingPayload, recentPayload] = await Promise.all([
      fetchRapidApiJson('/matches/v1/live'),
      fetchRapidApiJson('/matches/v1/upcoming'),
      fetchRapidApiJson('/matches/v1/recent'),
    ]);

    const liveEntries = flattenMatchEntries(livePayload);
    const upcomingEntries = flattenMatchEntries(upcomingPayload);
    const recentEntries = flattenMatchEntries(recentPayload);

    return {
      currentMatches: dedupeById(
        [...liveEntries, ...recentEntries, ...upcomingEntries].map((entry) =>
          mapMatchSummaryFromList(entry.matchInfo, entry.matchScore)
        )
      ),
      scoreFeed: dedupeById(
        [...liveEntries, ...upcomingEntries, ...recentEntries].map((entry) =>
          mapScoreFeedItem(entry.matchInfo, entry.matchScore)
        )
      ),
    };
  });
}

function extractSeriesEntries(payload = {}) {
  const seriesMapEntries = safeArray(payload.seriesMapProto).flatMap((entry) => safeArray(entry?.series));
  const seriesListEntries = safeArray(payload.seriesList);
  const seriesFromMatches = flattenMatchEntries(payload).map((entry) => ({
    seriesId: entry.seriesId,
    seriesName: entry.seriesName,
    startDate: entry.matchInfo?.startDate,
    endDate: entry.matchInfo?.endDate,
  }));

  return [...seriesMapEntries, ...seriesListEntries, ...seriesFromMatches];
}

function mapSeriesSummary(series = {}) {
  const id = String(series.seriesId ?? series.id ?? '');

  if (!id) {
    return undefined;
  }

  return {
    id,
    name: series.seriesName ?? series.name ?? 'Series',
    startDate: toIsoDate(series.startDate) ?? 'TBD',
    endDate: toIsoDate(series.endDate) ?? 'TBD',
    odi: 0,
    t20: 0,
    test: 0,
    squads: 0,
    matches: 0,
  };
}

async function getSeriesIndexLive() {
  return remember('rapidapi:series-index', SERIES_CACHE_TTL_MS, async () => {
    const results = await Promise.allSettled(
      SERIES_CATEGORIES.map((category) => fetchRapidApiJson(`/series/v1/${category}`))
    );

    const items = results
      .filter((result) => result.status === 'fulfilled')
      .flatMap((result) => extractSeriesEntries(result.value))
      .map(mapSeriesSummary)
      .filter(Boolean);

    return dedupeById(items).sort((left, right) => right.startDate.localeCompare(left.startDate));
  });
}

function inferSeriesCounts(matchList) {
  return matchList.reduce(
    (accumulator, match) => {
      accumulator.matches += 1;

      if (match.matchType === 't20') {
        accumulator.t20 += 1;
      } else if (match.matchType === 'odi') {
        accumulator.odi += 1;
      } else if (match.matchType === 'test') {
        accumulator.test += 1;
      }

      return accumulator;
    },
    { odi: 0, t20: 0, test: 0, matches: 0 }
  );
}

function extractSeriesMatches(payload = {}) {
  const typeMatches = flattenMatchEntries(payload);

  if (typeMatches.length) {
    return typeMatches;
  }

  if (safeArray(payload.matchInfo).length) {
    return payload.matchInfo.map((matchInfo) => ({
      matchInfo,
      matchScore: matchInfo.matchScore ?? {},
      seriesId: matchInfo.seriesId,
      seriesName: matchInfo.seriesName,
    }));
  }

  if (safeArray(payload.matches).length) {
    return payload.matches.map((match) => ({
      matchInfo: match.matchInfo ?? match,
      matchScore: match.matchScore ?? {},
      seriesId: match.seriesId ?? match.matchInfo?.seriesId,
      seriesName: match.seriesName ?? match.matchInfo?.seriesName,
    }));
  }

  return [];
}

async function getSeriesDetailsLive(id) {
  return remember(`rapidapi:series:${id}`, SERIES_CACHE_TTL_MS, async () => {
    let payload;

    try {
      payload = await fetchRapidApiJson(`/series/v1/${id}/matches`);
    } catch (error) {
      payload = await fetchRapidApiJson(`/series/v1/${id}`);
    }

    const matches = dedupeById(
      extractSeriesMatches(payload).map((entry) => mapMatchSummaryFromList(entry.matchInfo, entry.matchScore))
    );
    const counts = inferSeriesCounts(matches);
    const firstMatch = matches[0];
    const startDates = matches.map((match) => match.dateTimeGMT).filter(Boolean).sort();
    const endDates = [...startDates];

    return {
      info: {
        id: String(id),
        name: firstMatch?.name.split(',').slice(-1)[0]?.trim() || `Series ${id}`,
        startdate: startDates[0]?.slice(0, 10) ?? 'TBD',
        enddate: endDates.at(-1)?.slice(0, 10) ?? 'TBD',
        odi: counts.odi,
        t20: counts.t20,
        test: counts.test,
        squads: 0,
        matches: counts.matches,
      },
      matchList: matches,
    };
  });
}

function mapPlayerSummary(player = {}) {
  const id = String(player.id ?? player.playerId ?? '');

  if (!id) {
    return undefined;
  }

  return {
    id,
    name: player.name ?? player.playerName ?? 'Player',
    country: player.teamName ?? player.intlTeam ?? undefined,
    role: player.role ?? player.playingRole ?? undefined,
    playerImg: buildPlayerImageUrl(player.faceImageId, player.image),
  };
}

function mapStatsTable(payload, fn) {
  const headers = safeArray(payload?.headers).slice(1);
  const rows = safeArray(payload?.values);

  return headers.flatMap((format, index) =>
    rows
      .map((row) => {
        const values = safeArray(row?.values);
        const stat = values[0];
        const value = values[index + 1];

        if (!stat || value === undefined || value === null || value === '') {
          return undefined;
        }

        return {
          fn,
          matchtype: String(format),
          stat: String(stat),
          value: String(value),
        };
      })
      .filter(Boolean)
  );
}

async function searchPlayersLive(search) {
  const normalizedSearch = search?.trim();

  if (!normalizedSearch) {
    return [];
  }

  return remember(`rapidapi:player-search:${slug(normalizedSearch)}`, PLAYER_SEARCH_CACHE_TTL_MS, async () => {
    let payload;
    let lastError;

    for (const path of PLAYER_SEARCH_PATHS) {
      try {
        payload = await fetchRapidApiJson(path, { plrN: normalizedSearch });
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!payload) {
      throw lastError ?? new Error('Player search is unavailable right now.');
    }

    return dedupeById(safeArray(payload.player).map(mapPlayerSummary).filter(Boolean));
  });
}

async function getPlayerDetailsLive(id) {
  return remember(`rapidapi:player:${id}`, PLAYER_DETAIL_CACHE_TTL_MS, async () => {
    let profile;

    try {
      profile = await fetchRapidApiJson(`/stats/v1/player/${id}`);
    } catch (error) {
      profile = await fetchRapidApiJson(`/players/v1/${id}/info`);
    }

    const [batting, bowling] = await Promise.all([
      fetchRapidApiJson(`/stats/v1/player/${id}/batting`).catch(() => null),
      fetchRapidApiJson(`/stats/v1/player/${id}/bowling`).catch(() => null),
    ]);

    const player = mapPlayerSummary(profile) ?? { id: String(id), name: 'Player' };

    return {
      ...player,
      country: Array.isArray(profile.intlTeam) ? profile.intlTeam.join(', ') : profile.intlTeam ?? player.country,
      role: profile.role ?? player.role,
      battingStyle: profile.bat ?? profile.battingStyle,
      bowlingStyle: profile.bowl ?? profile.bowlingStyle,
      placeOfBirth: profile.birthPlace,
      stats: [...mapStatsTable(batting, 'batting'), ...mapStatsTable(bowling, 'bowling')],
    };
  });
}

function mapMatchScoreFromScorecard(scorecard = {}) {
  return safeArray(scorecard.scoreCard)
    .map((innings) => ({
      r: Number(innings?.scoreDetails?.runs ?? 0),
      w: Number(innings?.scoreDetails?.wickets ?? 0),
      o: Number(innings?.scoreDetails?.overs ?? 0),
      inning: `${innings?.batTeamDetails?.batTeamName ?? 'Team'} Inning ${innings?.inningsId ?? ''}`.trim(),
    }))
    .filter((innings) => innings.r || innings.w || innings.o);
}

function mapMatchSummaryFromCenter(payload = {}, fallbackMatch = undefined, score = []) {
  const matchInfo = payload.matchInfo ?? {};
  const team1 = matchInfo.team1 ?? {};
  const team2 = matchInfo.team2 ?? {};
  const lifecycle = getLifecycle(matchInfo.state, matchInfo.complete);
  const venue = matchInfo.venue ?? payload.venueInfo ?? {};

  return {
    ...(fallbackMatch ?? {}),
    id: String(matchInfo.matchId ?? fallbackMatch?.id ?? ''),
    name:
      fallbackMatch?.name ??
      `${team1.name ?? 'Team A'} vs ${team2.name ?? 'Team B'}, ${matchInfo.matchDescription ?? 'Match'}, ${matchInfo.series?.name ?? 'Series'}`,
    matchType: normalizeMatchType(matchInfo.matchFormat ?? matchInfo.matchType ?? fallbackMatch?.matchType),
    status: matchInfo.status ?? matchInfo.state ?? fallbackMatch?.status ?? 'Status unavailable',
    venue: [venue.ground, venue.city].filter(Boolean).join(', ') || fallbackMatch?.venue,
    date: toIsoDate(matchInfo.matchStartTimestamp) ?? fallbackMatch?.date,
    dateTimeGMT: toIsoDateTime(matchInfo.matchStartTimestamp) ?? fallbackMatch?.dateTimeGMT,
    teams: [team1.name ?? fallbackMatch?.teams?.[0] ?? 'Team A', team2.name ?? fallbackMatch?.teams?.[1] ?? 'Team B'],
    teamInfo: [
      mapTeamInfo(team1.name, team1.shortName, team1.imageId),
      mapTeamInfo(team2.name, team2.shortName, team2.imageId),
    ],
    score: score.length ? score : fallbackMatch?.score ?? [],
    series_id: matchInfo.series?.id ? String(matchInfo.series.id) : fallbackMatch?.series_id,
    hasSquad: true,
    matchStarted: lifecycle.matchStarted,
    matchEnded: lifecycle.matchEnded,
    tossWinner: matchInfo.tossResults?.tossWinnerName,
    tossChoice: matchInfo.tossResults?.decision,
    matchWinner: matchInfo.result?.winningTeam,
  };
}

function mapSquadTeam(team = {}) {
  return {
    teamName: team.name ?? 'Team',
    shortname: team.shortName,
    players: safeArray(team.playerDetails).map((player) => ({
      id: String(player.id),
      name: player.name ?? player.fullName ?? 'Player',
      country: team.name,
      role: player.role ?? undefined,
      battingStyle: player.battingStyle,
      bowlingStyle: player.bowlingStyle,
    })),
  };
}

async function getMatchCenterBundleLive(id) {
  return remember(`rapidapi:match:${id}`, MATCH_DETAIL_CACHE_TTL_MS, async () => {
    const center = await fetchRapidApiJson(`/mcenter/v1/${id}`);
    const homeBundle = peek('rapidapi:home-bundle');
    const fallbackMatch = homeBundle?.currentMatches?.find((match) => match.id === String(id));
    const scorePath = center?.matchInfo?.complete ? `/mcenter/v1/${id}/hscard` : `/mcenter/v1/${id}/scard`;
    const scorecard = await fetchRapidApiJson(scorePath).catch(() => null);
    const score = mapMatchScoreFromScorecard(scorecard);

    return {
      match: mapMatchSummaryFromCenter(center, fallbackMatch, score),
      squad: [mapSquadTeam(center?.matchInfo?.team1), mapSquadTeam(center?.matchInfo?.team2)].filter(
        (team) => team.players.length
      ),
    };
  });
}

async function requestLiveData(loader, fallback, label) {
  if (!hasRapidApiConfig()) {
    return createDemoPayload(fallback());
  }

  try {
    return createLivePayload(await loader());
  } catch (error) {
    console.warn(`Falling back to backend demo data for ${label}`, error);
    return createDemoPayload(fallback());
  }
}

module.exports = {
  getCurrentMatchesPayload: () =>
    requestLiveData(async () => (await getHomeBundleLive()).currentMatches, getDemoCurrentMatches, 'current-matches'),
  getScoreFeedPayload: () =>
    requestLiveData(async () => (await getHomeBundleLive()).scoreFeed, getDemoScoreFeed, 'score-feed'),
  getSeriesPayload: (params = {}) =>
    requestLiveData(
      async () => {
        const series = await getSeriesIndexLive();
        const normalizedSearch = slug(params.search);
        return normalizedSearch ? series.filter((item) => slug(item.name).includes(normalizedSearch)) : series;
      },
      () => getDemoSeries(params.search),
      'series'
    ),
  getSeriesInfoPayload: (id) =>
    requestLiveData(async () => getSeriesDetailsLive(id), () => getDemoSeriesInfo(id), `series:${id}`),
  getPlayersPayload: (params = {}) =>
    requestLiveData(async () => searchPlayersLive(params.search), () => getDemoPlayers(params.search), 'players'),
  getPlayerInfoPayload: (id) =>
    requestLiveData(async () => getPlayerDetailsLive(id), () => getDemoPlayerInfo(id), `player:${id}`),
  getMatchInfoPayload: (id) =>
    requestLiveData(async () => (await getMatchCenterBundleLive(id)).match, () => getDemoMatchInfo(id), `match:${id}`),
  getMatchSquadPayload: (id) =>
    requestLiveData(async () => (await getMatchCenterBundleLive(id)).squad, () => getDemoMatchSquad(id), `match-squad:${id}`),
};
