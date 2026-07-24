const prisma = require('./prisma');

/**  Records an entry in the append-only audit log. Call this any time a user views or modifies PHI-equivalent data (intake forms, appointments, patient profiles).
 *
 * @param {Object} params
 * @param {string} params.actorId - id of the User performing the action
 * @param {string} params.action - short verb, e.g. "VIEW_INTAKE_FORM", "UPDATE_APPOINTMENT"
 * @param {string} params.targetType - the resource type, e.g. "IntakeForm"
 * @param {string} [params.targetId] - the resource id, if applicable
 */
async function recordAudit({ actorId, action, targetType, targetId }) {
  try {
    await prisma.auditLog.create({
      data: { actorId, action, targetType, targetId },
    });
  } catch (err) {
    // Audit logging should never crash the primary request.
    // In production this should also alert - a silent audit failure
    // is itself a compliance issue.
    console.error('Failed to write audit log:', err.message);
  }
}

module.exports = { recordAudit };