const { z } = require('zod');
const prisma = require('../utils/prisma');
const { recordAudit } = require('../utils/auditLog');

const bookSchema = z.object({
  slotId: z.string().uuid(),
  reasonForVisit: z.string().optional(),
  symptomNotes: z.string().optional(),
});

const symptomsSchema = z.object({
  reasonForVisit: z.string().optional(),
  symptomNotes: z.string().optional(),
});

async function getOwnProfile(userId) {
  return prisma.patientProfile.findUnique({ where: { userId } });
}


async function book(req, res) {
  const data = bookSchema.parse(req.body);
  const profile = await getOwnProfile(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Patient profile not found' });

  const appointment = await prisma.$transaction(async (tx) => {
    const slot = await tx.slot.findUnique({ where: { id: data.slotId } });
    if (!slot || !slot.isAvailable) {
      const err = new Error('Slot is no longer available');
      err.status = 409;
      throw err;
    }

    await tx.slot.update({ where: { id: slot.id }, data: { isAvailable: false } });

    return tx.appointment.create({
      data: {
        patientId: profile.id,
        slotId: slot.id,
        reasonForVisit: data.reasonForVisit,
        symptomNotes: data.symptomNotes,
      },
    });
  });

  res.status(201).json(appointment);
}


async function listMine(req, res) {
  const profile = await getOwnProfile(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Patient profile not found' });

  const appointments = await prisma.appointment.findMany({
    where: { patientId: profile.id },
    include: { slot: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(appointments);
}


async function cancel(req, res) {
  const profile = await getOwnProfile(req.user.id);
  const appointment = await prisma.appointment.findUnique({ where: { id: req.params.id } });

  if (!appointment || appointment.patientId !== profile.id) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  // TODO: enforce the configurable cancellation window (e.g. 24h) here,
  // comparing now() to appointment.slot.startTime once fetched.

  await prisma.$transaction([
    prisma.appointment.update({ where: { id: appointment.id }, data: { status: 'CANCELLED' } }),
    prisma.slot.update({ where: { id: appointment.slotId }, data: { isAvailable: true } }),
  ]);

  res.status(204).end();
}


async function updateSymptoms(req, res) {
  const data = symptomsSchema.parse(req.body);
  const profile = await getOwnProfile(req.user.id);
  const appointment = await prisma.appointment.findUnique({ where: { id: req.params.id } });

  if (!appointment || appointment.patientId !== profile.id) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  if (appointment.checkedInAt) {
    return res.status(409).json({ error: 'Cannot edit symptoms after check-in' });
  }

  const updated = await prisma.appointment.update({
    where: { id: appointment.id },
    data,
  });
  res.json(updated);
}

// GET /api/v1/appointments/today  (staff dashboard) - FR-5.1
async function listToday(req, res) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: { slot: { startTime: { gte: start, lte: end } }, status: 'BOOKED' },
    include: { slot: true, patient: { include: { intakeForm: true } } },
    orderBy: { slot: { startTime: 'asc' } },
  });

  res.json(appointments);
}

async function listUpcoming(req, res) {
  const days = Math.min(Number(req.query.days) || 7, 31);

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  end.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: { slot: { startTime: { gte: start, lte: end } }, status: 'BOOKED' },
    include: { slot: true, patient: { include: { intakeForm: true } } },
    orderBy: { slot: { startTime: 'asc' } },
  });

  res.json(appointments);
}

async function checkIn(req, res) {
  const appointment = await prisma.appointment.update({
    where: { id: req.params.id },
    data: { checkedInAt: new Date() },
  });

  await recordAudit({
    actorId: req.user.id,
    action: 'CHECK_IN',
    targetType: 'Appointment',
    targetId: appointment.id,
  });

  res.json(appointment);
}

module.exports = { book, listMine, cancel, updateSymptoms, listToday, listUpcoming, checkIn };
