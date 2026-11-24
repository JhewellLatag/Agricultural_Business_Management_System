// WBS 4.4.1 — System Activity and Audit Logging
// Assigned Member(s): Jhewell Latag
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// utils/activityLog.js - nagre-record ng bawat galaw sa system (4.4.1)
const model = require('../models/auditLoggerServiceModel');

async function logActivity(user, department, action) {
  await model.createActivityLog([user.id, user.username, department, action]);
}

module.exports = { logActivity };
