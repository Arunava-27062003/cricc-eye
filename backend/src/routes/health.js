const { Router } = require('express');

const healthRouter = Router();

healthRouter.get('/', (_request, response) => {
  response.json({
    status: 'ok',
    service: 'criccbuzz-backend',
  });
});

module.exports = { healthRouter };
