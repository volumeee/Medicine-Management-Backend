const pool = require("../config/database");

async function createPasswordResetTokensTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Password Reset Tokens table created successfully");
  } catch (error) {
    console.error("Error creating password_reset_tokens table:", error);
  } finally {
    client.release();
  }
}

module.exports = createPasswordResetTokensTable;
