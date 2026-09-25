const { z } = require('zod');
const prisma = require('../utils/prisma');

const createSlotSchema = z.object({
  startTime: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid startTime'),
  endTime: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid endTime'),
});

async function listAvailable(req, res) {
  const { from, to } = req.query;
  const where = { isAvailable: true };
  if (from || to) {
    where.startTime = {};
    if (from) where.startTime.gte = new Date(from);
    if (to) where.startTime.lte = new Date(to);
  }

  const slots = await prisma.slot.findMany({ where, orderBy: { startTime: 'asc' } });
  res.json(slots);
}

async function create(req, res) {
  const data = createSlotSchema.parse(req.body);
  const slot = await prisma.slot.create({
    data: { startTime: new Date(data.startTime), endTime: new Date(data.endTime) },
  });
  res.status(201).json(slot);
}

async function remove(req, res) {
  await prisma.slot.delete({ where: { id: req.params.id } });
  res.status(204).end();
}

module.exports = { listAvailable, create, remove };
