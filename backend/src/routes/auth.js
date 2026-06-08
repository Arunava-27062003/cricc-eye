const { Router } = require('express');
const { z } = require('zod');

const { comparePassword, createAccessToken, hashPassword } = require('../lib/auth');
const { prisma } = require('../lib/prisma');

const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(50),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

authRouter.post('/register', async (request, response) => {
  const { email, password, displayName } = registerSchema.parse(request.body);
  const normalizedEmail = email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    response.status(409).json({ message: 'A user with this email already exists.' });
    return;
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      displayName,
      profile: {
        create: {},
      },
    },
    include: {
      profile: true,
    },
  });

  const token = createAccessToken({
    sub: user.id,
    email: user.email,
  });

  response.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      profile: user.profile,
    },
  });
});

authRouter.post('/login', async (request, response) => {
  const { email, password } = loginSchema.parse(request.body);
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { profile: true },
  });

  if (!user) {
    response.status(401).json({ message: 'Invalid email or password.' });
    return;
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);

  if (!passwordMatches) {
    response.status(401).json({ message: 'Invalid email or password.' });
    return;
  }

  const token = createAccessToken({
    sub: user.id,
    email: user.email,
  });

  response.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      profile: user.profile,
    },
  });
});

module.exports = { authRouter };
