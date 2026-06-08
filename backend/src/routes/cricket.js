const { Router } = require('express');

const { fetchCricketResource } = require('../lib/cricket-api');

const cricketRouter = Router();

cricketRouter.get('/current-matches', async (request, response) => {
  const payload = await fetchCricketResource('/currentMatches', {
    offset: request.query.offset,
  });

  response.json(payload);
});

cricketRouter.get('/score-feed', async (_request, response) => {
  const payload = await fetchCricketResource('/cricScore');
  response.json(payload);
});

cricketRouter.get('/series', async (request, response) => {
  const payload = await fetchCricketResource('/series', {
    offset: request.query.offset ?? '0',
    search: request.query.search,
  });

  response.json(payload);
});

cricketRouter.get('/series/:id', async (request, response) => {
  const payload = await fetchCricketResource('/series_info', {
    id: request.params.id,
  });

  response.json(payload);
});

cricketRouter.get('/players', async (request, response) => {
  const payload = await fetchCricketResource('/players', {
    offset: request.query.offset ?? '0',
    search: request.query.search,
  });

  response.json(payload);
});

cricketRouter.get('/players/:id', async (request, response) => {
  const payload = await fetchCricketResource('/players_info', {
    id: request.params.id,
  });

  response.json(payload);
});

cricketRouter.get('/matches/:id', async (request, response) => {
  const payload = await fetchCricketResource('/match_info', {
    id: request.params.id,
  });

  response.json(payload);
});

cricketRouter.get('/matches/:id/squad', async (request, response) => {
  const payload = await fetchCricketResource('/match_squad', {
    id: request.params.id,
  });

  response.json(payload);
});

module.exports = { cricketRouter };
