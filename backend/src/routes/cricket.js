const { Router } = require('express');

const {
  getCurrentMatchesPayload,
  getMatchInfoPayload,
  getMatchSquadPayload,
  getPlayerInfoPayload,
  getPlayersPayload,
  getScoreFeedPayload,
  getSeriesInfoPayload,
  getSeriesPayload,
} = require('../lib/cricket-api');

const cricketRouter = Router();

cricketRouter.get('/current-matches', async (request, response) => {
  const payload = await getCurrentMatchesPayload({
    offset: request.query.offset,
  });

  response.json(payload);
});

cricketRouter.get('/score-feed', async (_request, response) => {
  const payload = await getScoreFeedPayload();
  response.json(payload);
});

cricketRouter.get('/series', async (request, response) => {
  const payload = await getSeriesPayload({
    offset: request.query.offset ?? '0',
    search: request.query.search,
  });

  response.json(payload);
});

cricketRouter.get('/series/:id', async (request, response) => {
  const payload = await getSeriesInfoPayload(request.params.id);

  response.json(payload);
});

cricketRouter.get('/players', async (request, response) => {
  const payload = await getPlayersPayload({
    offset: request.query.offset ?? '0',
    search: request.query.search,
  });

  response.json(payload);
});

cricketRouter.get('/players/:id', async (request, response) => {
  const payload = await getPlayerInfoPayload(request.params.id);

  response.json(payload);
});

cricketRouter.get('/matches/:id', async (request, response) => {
  const payload = await getMatchInfoPayload(request.params.id);

  response.json(payload);
});

cricketRouter.get('/matches/:id/squad', async (request, response) => {
  const payload = await getMatchSquadPayload(request.params.id);

  response.json(payload);
});

module.exports = { cricketRouter };
