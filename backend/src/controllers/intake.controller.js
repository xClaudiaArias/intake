const { z } = require('zod');
const prisma = require('../utils/prisma');
const { recordAudit } = require('../utils/auditLog');

const intakeSchema = z.object({
  insuranceInfo: z.record(z.any()).optional(),
  medicalHistory: z.record(z.any()).optional(),
});

async function getOwnProfile(userId) {
  return prisma.patientProfile.findUnique({ where: { userId } });
}

// GET /api/v1/intake  (patient: their own form)
async function getMine(req, res) {
  const profile = await getOwnProfile(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Patient profile not found' });

  const form = await prisma.intakeForm.findUnique({ where: { patientId: profile.id } });
  res.json(form || null);
}

// PUT /api/v1/intake  (patient: save as draft) - FR-2.2
async function saveDraft(req, res) {
  const data = intakeSchema.parse(req.body);
  const profile = await getOwnProfile(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Patient profile not found' });

  const existing = await prisma.intakeForm.findUnique({ where: { patientId: profile.id } });
  if (existing?.status === 'SUBMITTED') {
    return res.status(409).json({ error: 'Form already submitted. Contact staff to request an update.' });
  }

  const form = await prisma.intakeForm.upsert({
    where: { patientId: profile.id },
    update: { ...data, status: 'DRAFT' },
    create: { ...data, patientId: profile.id, status: 'DRAFT' },
  });

  res.json(form);
}

// POST /api/v1/intake/submit  (patient: lock the form) - FR-2.3
async function submit(req, res) {
  const profile = await getOwnProfile(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Patient profile not found' });

  const form = await prisma.intakeForm.update({
    where: { patientId: profile.id },
    data: { status: 'SUBMITTED', submittedAt: new Date() },
  });

  res.json(form);
}

// GET /api/v1/intake/:patientId  (staff/admin, read-only) - FR-2.4
async function getForPatient(req, res) {
  const form = await prisma.intakeForm.findUnique({
    where: { patientId: req.params.patientId },
  });
  if (!form) return res.status(404).json({ error: 'Intake form not found' });

  await recordAudit({
    actorId: req.user.id,
    action: 'VIEW_INTAKE_FORM',
    targetType: 'IntakeForm',
    targetId: form.id,
  });

  res.json(form);
}

module.exports = { getMine, saveDraft, submit, getForPatient };
