const { z } = require('zod');
const prisma = require('../utils/prisma');

const createSlotSchema = z.object({
  startTime: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid startTime'),
  endTime: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid endTime'),
});

// GET /api/v1/slots?from=&to=  (anyone authenticated: only available slots) - FR-3.1
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

// POST /api/v1/slots  (staff/admin) - FR-3.3
async function create(req, res) {
  const data = createSlotSchema.parse(req.body);
  const slot = await prisma.slot.create({
    data: { startTime: new Date(data.startTime), endTime: new Date(data.endTime) },
  });
  res.status(201).json(slot);
}

// DELETE /api/v1/slots/:id  (staff/admin) - block off a slot
async function remove(req, res) {
  await prisma.slot.delete({ where: { id: req.params.id } });
  res.status(204).end();
}

module.exports = { listAvailable, create, remove };
