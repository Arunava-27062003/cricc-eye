const { ZodError } = require('zod');

function errorHandler(error, _request, response, _next) {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: 'Validation failed.',
      issues: error.flatten(),
    });
    return;
  }

  if (error instanceof Error) {
    response.status(500).json({
      message: error.message,
    });
    return;
  }

  response.status(500).json({
    message: 'Unexpected server error.',
  });
}

module.exports = { errorHandler };
