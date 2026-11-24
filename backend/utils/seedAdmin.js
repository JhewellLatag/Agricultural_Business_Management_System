// utils/seedAdmin.js - run: npm run seed
// Gumagawa ng unang accounts para makapag-login kayo.
const bcrypt = require('bcryptjs');
const model = require('../models/seedAdminUtilityModel');

(async () => {
  const accounts = [
    ['Administrator', 'admin', 'admin123', 'admin'],
    ['Gulayan Staff', 'gulayan', 'staff123', 'gulayan'],
    ['Prutasan Staff', 'prutasan', 'staff123', 'prutasan'],
    ['Babuyan Staff', 'babuyan', 'staff123', 'babuyan'],
  ];
  for (const [name, username, pass, role] of accounts) {
    await model.createUserIfMissing([name, username, await bcrypt.hash(pass, 10), role]);
  }
  console.log('Done. Login: admin / admin123');
  process.exit();
})();
