const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
});
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env.local'),
  override: true,
});

const { z } = require('zod');

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
  CRICKET_API_KEY: z.string().optional(),
  RAPIDAPI_KEY: z.string().optional(),
  RAPIDAPI_HOST: z.string().default('cricbuzz-cricket.p.rapidapi.com'),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('*'),
});

function resolveDatabaseUrl(databaseUrl) {
  if (!databaseUrl.startsWith('file:./') && !databaseUrl.startsWith('file:../')) {
    return databaseUrl;
  }

  const relativeFilePath = databaseUrl.slice('file:'.length);
  const absoluteFilePath = path.resolve(__dirname, '../../', relativeFilePath).replace(/\\/g, '/');

  return `file:${absoluteFilePath}`;
}

const parsedEnv = envSchema.parse(process.env);
const env = {
  ...parsedEnv,
  DATABASE_URL: resolveDatabaseUrl(parsedEnv.DATABASE_URL),
};

process.env.DATABASE_URL = env.DATABASE_URL;

module.exports = { env };
