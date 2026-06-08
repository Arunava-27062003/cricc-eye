const { env } = require('../config/env');

const CRICAPI_BASE_URL = 'https://api.cricapi.com/v1';

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

module.exports = { fetchCricketResource };
