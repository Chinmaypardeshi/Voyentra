const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:123%40Zxcvbnm%40123@db.zexqcbyyosuzmhodyaxk.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

let isConnected = false;

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ [Database] Connection failed:', err.message);
    isConnected = false;
  } else {
    console.log('✅ [Database] Live connection to Supabase PostgreSQL verified at', res.rows[0].now);
    isConnected = true;
  }
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  isLive: () => isConnected
};
