# Crickit

A dark-first Expo cricket app with a separate Express backend for users, profiles, and proxied cricket API access.

## App setup

1. Install the root dependencies:

   ```bash
   npm install
   ```

2. Start the Expo app:

   ```bash
   npm run start
   ```

3. The repo now includes a root `.env` with:

   ```bash
   EXPO_PUBLIC_BACKEND_URL=auto
   ```

   During local Expo development, `auto` derives the backend host from Expo and targets port `4000`. If needed, replace it with an explicit URL such as `http://192.168.1.20:4000`.

## Backend setup

The backend lives in `backend/` and uses:

- Express (JavaScript/CommonJS)
- Prisma + SQLite
- JWT auth with hashed passwords
- RapidAPI Cricbuzz proxy routes with backend caching and demo fallback

### First-time backend setup

1. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

2. The backend `.env` file is already present with placeholder values. Put your real secrets in `backend/.env.local` so they override the placeholders without being tracked:

   ```bash
   JWT_SECRET=your-real-secret
   RAPIDAPI_KEY=your-real-rapidapi-key
   ```

3. Set these values in `backend/.env.local`:

   - `DATABASE_URL`
   - `JWT_SECRET`
   - `RAPIDAPI_KEY`
   - `RAPIDAPI_HOST`
   - `PORT`
   - `HOST`
   - `CORS_ORIGIN`

4. Run the initial migration:

   ```bash
   npm run prisma:migrate -- --name init
   ```

5. Start the backend:

   ```bash
   npm run dev
   ```

### Root convenience scripts

From the repository root you can run:

```bash
npm run backend:dev
npm run backend:build
npm run backend:migrate -- --name init
```

## Backend API surface

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### User/profile

- `GET /api/users/me`
- `PATCH /api/users/me`

These require a bearer token from the auth endpoints.

### Cricket proxy

- `GET /api/cricket/current-matches`
- `GET /api/cricket/score-feed`
- `GET /api/cricket/series`
- `GET /api/cricket/series/:id`
- `GET /api/cricket/players`
- `GET /api/cricket/players/:id`
- `GET /api/cricket/matches/:id`
- `GET /api/cricket/matches/:id/squad`

## Notes

- The mobile app now uses the backend for both auth/profile and cricket data when `EXPO_PUBLIC_BACKEND_URL` is configured.
- The backend now uses RapidAPI Cricbuzz as the primary live source and falls back to bundled demo data if the key is missing, the quota is exhausted, or live data is unavailable.
- The app uses longer cache windows for cricket queries so normal navigation does not repeatedly consume the free-tier quota.
