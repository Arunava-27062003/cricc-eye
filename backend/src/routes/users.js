const { Router } = require('express');
const { z } = require('zod');

const { prisma } = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

const usersRouter = Router();

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(280).optional(),
  favoriteTeam: z.string().max(80).optional(),
  avatarUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .transform((value) => (value === '' ? undefined : value)),
});

usersRouter.get('/me', requireAuth, async (request, response) => {
  const user = await prisma.user.findUnique({
    where: { id: request.auth.userId },
    include: { profile: true },
  });

  if (!user) {
    response.status(404).json({ message: 'User not found.' });
    return;
  }

  response.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      profile: user.profile,
    },
  });
});

usersRouter.patch('/me', requireAuth, async (request, response) => {
  const input = updateProfileSchema.parse(request.body);

  const user = await prisma.user.update({
    where: { id: request.auth.userId },
    data: {
      displayName: input.displayName,
      profile: {
        upsert: {
          create: {
            bio: input.bio,
            favoriteTeam: input.favoriteTeam,
            avatarUrl: input.avatarUrl,
          },
          update: {
            bio: input.bio,
            favoriteTeam: input.favoriteTeam,
            avatarUrl: input.avatarUrl,
          },
        },
      },
    },
    include: {
      profile: true,
    },
  });

  response.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      profile: user.profile,
    },
  });
});

module.exports = { usersRouter };
