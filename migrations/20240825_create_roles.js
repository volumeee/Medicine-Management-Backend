const pool = require("../config/database");

async function createRolesTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        name varchar(50) UNIQUE NOT NULL,
        description text,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Roles table created successfully");
  } catch (error) {
    console.error("Error creating roles table:", error);
  } finally {
    client.release();
  }
}

module.exports = createRolesTable;
