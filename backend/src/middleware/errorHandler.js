// Catches errors thrown (or passed via next(err)) from any route.
// Requires 'express-async-errors' to be imported once in app.js so that
// errors thrown inside async route handlers are routed here automatically.
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;

  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
