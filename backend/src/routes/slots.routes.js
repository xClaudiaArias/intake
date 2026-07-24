const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { listAvailable, create, remove } = require('../controllers/slots.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', listAvailable);
router.post('/', requireRole('STAFF', 'ADMIN'), create);
router.delete('/:id', requireRole('STAFF', 'ADMIN'), remove);

module.exports = router;
