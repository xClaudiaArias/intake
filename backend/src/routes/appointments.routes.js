const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const {
  book,
  listMine,
  cancel,
  updateSymptoms,
  listToday,
  listUpcoming,
  checkIn,
} = require('../controllers/appointments.controller');

const router = express.Router();

router.use(requireAuth);

router.post('/', requireRole('PATIENT'), book);
router.get('/mine', requireRole('PATIENT'), listMine);
router.patch('/:id/cancel', requireRole('PATIENT'), cancel);
router.patch('/:id/symptoms', requireRole('PATIENT'), updateSymptoms);

router.get('/today', requireRole('STAFF', 'ADMIN'), listToday);
router.get('/upcoming', requireRole('STAFF', 'ADMIN'), listUpcoming);
router.patch('/:id/check-in', requireRole('STAFF', 'ADMIN'), checkIn);

module.exports = router;

