const pool = require("../config/database");

class PasswordResetToken {
  static async create(userId, token, expiresAt) {
    const query =
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *";
    const values = [userId, token, expiresAt];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByToken(token) {
    const query = "SELECT * FROM password_reset_tokens WHERE token = $1";
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  static async deleteByUserId(userId) {
    const query = "DELETE FROM password_reset_tokens WHERE user_id = $1";
    await pool.query(query, [userId]);
  }
}

module.exports = PasswordResetToken;
