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

const CRICAPI_BASE_URL = 'https://api.cricapi.com/v1';
const DEMO_MESSAGE = 'Live updates are temporarily unavailable, so sample scores are being shown.';

function createDemoPayload(data) {
  return {
    status: 'success',
    data,
    source: 'demo',
    message: DEMO_MESSAGE,
  };
}

async function fetchCricketResource(path, params = {}) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }

  searchParams.set('apikey', env.CRICKET_API_KEY);

  const response = await fetch(`${CRICAPI_BASE_URL}${path}?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error(`CricAPI request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const { apikey: _apikey, ...rest } = payload;

  return rest;
}

async function requestCricketResource(path, fallback, params = {}) {
  const shouldServeDemo = !env.CRICKET_API_KEY || env.CRICKET_API_KEY === 'your-cricapi-key';

  if (shouldServeDemo) {
    return createDemoPayload(fallback());
  }

  try {
    const payload = await fetchCricketResource(path, params);

    if (payload.status !== 'success' || payload.data == null) {
      throw new Error(`CricAPI response did not return usable data for ${path}`);
    }

    return {
      ...payload,
      source: 'live',
    };
  } catch (error) {
    console.warn(`Falling back to backend demo data for ${path}`, error);
    return createDemoPayload(fallback());
  }
}

module.exports = {
  getCurrentMatchesPayload: (params = {}) => requestCricketResource('/currentMatches', getDemoCurrentMatches, params),
  getScoreFeedPayload: () => requestCricketResource('/cricScore', getDemoScoreFeed),
  getSeriesPayload: (params = {}) => requestCricketResource('/series', () => getDemoSeries(params.search), params),
  getSeriesInfoPayload: (id) => requestCricketResource('/series_info', () => getDemoSeriesInfo(id), { id }),
  getPlayersPayload: (params = {}) => requestCricketResource('/players', () => getDemoPlayers(params.search), params),
  getPlayerInfoPayload: (id) => requestCricketResource('/players_info', () => getDemoPlayerInfo(id), { id }),
  getMatchInfoPayload: (id) => requestCricketResource('/match_info', () => getDemoMatchInfo(id), { id }),
  getMatchSquadPayload: (id) => requestCricketResource('/match_squad', () => getDemoMatchSquad(id), { id }),
};
