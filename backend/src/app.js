require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth.routes');
const intakeRoutes = require('./routes/intake.routes');
const slotsRoutes = require('./routes/slots.routes');
const appointmentsRoutes = require('./routes/appointments.routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/intake', intakeRoutes);
app.use('/api/v1/slots', slotsRoutes);
app.use('/api/v1/appointments', appointmentsRoutes);

// TODO: mount /api/v1/users (admin staff management) and
// /api/v1/audit-logs (admin-only log viewer) once built - see SRS FR-6, FR-8.

app.use(errorHandler);

module.exports = app;
