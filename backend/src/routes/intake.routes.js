const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { getMine, saveDraft, submit, getForPatient } = require('../controllers/intake.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', requireRole('PATIENT'), getMine);
router.put('/', requireRole('PATIENT'), saveDraft);
router.post('/submit', requireRole('PATIENT'), submit);
router.get('/:patientId', requireRole('STAFF', 'ADMIN'), getForPatient);

module.exports = router;
