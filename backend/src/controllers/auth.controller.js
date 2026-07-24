const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../utils/prisma');
const { recordAudit } = require('../utils/auditLog');

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1),
  dob: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function issueTokens(user) {
  const accessToken = jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  const refreshToken = jwt.sign(
    { sub: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken };
}

// POST /api/v1/auth/register
// Self-registration is PATIENT-only. Staff/Admin accounts are created by an
// Admin via a separate endpoint (see users.controller) - see FR-1.4 in the SRS.
async function register(req, res) {
  const data = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      role: 'PATIENT',
      patientProfile: {
        create: {
          name: data.name,
          dob: new Date(data.dob),
        },
      },
    },
    include: { patientProfile: true },
  });

  await recordAudit({ actorId: user.id, action: 'REGISTER', targetType: 'User', targetId: user.id });

  const tokens = issueTokens(user);
  res.status(201).json({
    user: { id: user.id, email: user.email, role: user.role },
    ...tokens,
  });
}

// POST /api/v1/auth/login
async function login(req, res) {
  const data = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  await recordAudit({ actorId: user.id, action: 'LOGIN', targetType: 'User', targetId: user.id });

  const tokens = issueTokens(user);
  res.json({
    user: { id: user.id, email: user.email, role: user.role },
    ...tokens,
  });
}

// POST /api/v1/auth/refresh
async function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'refreshToken is required' });
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    return res.status(401).json({ error: 'User no longer exists' });
  }

  const tokens = issueTokens(user);
  res.json(tokens);
}

module.exports = { register, login, refresh };
