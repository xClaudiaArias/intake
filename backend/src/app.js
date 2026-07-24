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


app.use(errorHandler);

module.exports = app;
