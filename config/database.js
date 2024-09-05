const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  // localhost
  // host: process.env.DB_HOST,
  // port: process.env.DB_PORT,
  // database: process.env.DB_NAME,
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,

  // remote
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
