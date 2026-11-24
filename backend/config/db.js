// config/db.js - koneksyon sa MySQL ng XAMPP
// Default ng XAMPP: user "root", walang password. Palitan dito kung iba sa inyo.
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'agri_business',
  dateStrings: ['DATE'], // iwas timezone shift sa mga petsa
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
