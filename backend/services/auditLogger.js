const db = require('../config/db');

// ==========================================
// 4.4 SYSTEM ACTIVITY AND AUDIT LOGGING (REUSABLE LOGGER)
// ==========================================
exports.logActivity = async ({
  user = null,
  department = 'All',
  module_name = 'General',
  action_type = 'ACTION',
  record_id = null,
  details = '',
}) => {
  try {
    const formattedDetails =
      details === null || details === undefined
        ? ''
        : typeof details === 'object'
        ? JSON.stringify(details)
        : String(details);

    await db.query(
      `INSERT INTO system_audit_logs 
       (user_id, username, user_role, department, module_name, action_type, record_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user?.id || null,
        user?.username || 'System',
        user?.role || 'System',
        department || 'All',
        module_name,
        action_type,
        record_id ? String(record_id) : null,
        formattedDetails,
      ]
    );
  } catch (error) {
    console.error('Audit Logging Error:', error.message);
  }
};

// Retrieve filtered activity logs for Admin monitoring (by user, department, and date)
exports.getAuditLogs = async ({ user, department, date } = {}) => {
  let query = `
    SELECT id, user_id, username, user_role, department, module_name, action_type, record_id, details, created_at
    FROM system_audit_logs
    WHERE 1=1
  `;
  const params = [];

  if (user && String(user).trim() !== '') {
    const trimmedUser = String(user).trim();
    query +=  AND (username LIKE ? OR CAST(user_id AS CHAR) = ?);
    params.push(%${trimmedUser}%, trimmedUser);
  }

  if (department && department !== 'ALL') {
    query +=  AND department = ?;
    params.push(department);
  }

  if (date && String(date).trim() !== '') {
    query +=  AND DATE(created_at) = ?;
    params.push(String(date).trim());
  }

  query +=  ORDER BY created_at DESC, id DESC;

  const [logs] = await db.query(query, params);
  return logs;
};