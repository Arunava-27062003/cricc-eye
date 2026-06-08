const cache = new Map();

function peek(key) {
  const entry = cache.get(key);

  if (!entry) {
    return undefined;
  }

  if (entry.expiresAt > Date.now()) {
    return entry.value;
  }

  if (!entry.promise) {
    cache.delete(key);
  }

  return undefined;
}

async function remember(key, ttlMs, loader) {
  const cached = cache.get(key);

  if (cached?.value !== undefined && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  if (cached?.promise) {
    return cached.promise;
  }

  const promise = Promise.resolve()
    .then(loader)
    .then((value) => {
      cache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
      });
      return value;
    })
    .catch((error) => {
      cache.delete(key);
      throw error;
    });

  cache.set(key, {
    expiresAt: Date.now() + ttlMs,
    promise,
  });

  return promise;
}

module.exports = { peek, remember };
