const { verifyAccessToken } = require('../lib/auth');

function requireAuth(request, response, next) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    response.status(401).json({ message: 'Authorization token is required.' });
    return;
  }

  try {
    const token = authorization.slice('Bearer '.length).trim();
    const payload = verifyAccessToken(token);

    request.auth = {
      userId: payload.sub,
      email: payload.email,
    };

    next();
  } catch {
    response.status(401).json({ message: 'Authorization token is invalid or expired.' });
  }
}

module.exports = { requireAuth };
