const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
});

const { defineConfig } = require('prisma/config');

function resolveDatabaseUrl(databaseUrl) {
  if (!databaseUrl || (!databaseUrl.startsWith('file:./') && !databaseUrl.startsWith('file:../'))) {
    return databaseUrl;
  }

  const relativeFilePath = databaseUrl.slice('file:'.length);
  const absoluteFilePath = path.resolve(__dirname, relativeFilePath).replace(/\\/g, '/');

  return `file:${absoluteFilePath}`;
}

process.env.DATABASE_URL = resolveDatabaseUrl(process.env.DATABASE_URL);

module.exports = defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
});
