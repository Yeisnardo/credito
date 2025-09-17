const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',        // reemplaza con tus datos
  host: 'localhost',
  database: 'siccee', // reemplaza con tu base
  password: '13092003',   // reemplaza con tu password
  port: 5432,
});

const query = (text, params) => pool.query(text, params);

module.exports = { query };

