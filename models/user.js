const pool = require("../config/database");
const bcrypt = require("bcrypt");

class User {
  static async create(username, email, password, roleId) {
    const passwordHash = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (username, email, password_hash, role_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [username, email, passwordHash, roleId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const query = "SELECT * FROM users WHERE username = $1";
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async update(id, updateData) {
    updateData.updated_at = "CURRENT_TIMESTAMP";
    const fields = Object.keys(updateData);
    const values = Object.values(updateData).filter(
      (value) => value !== "CURRENT_TIMESTAMP"
    );

    const setClause = fields
      .map((field, index) => {
        return field === "updated_at"
          ? `${field} = CURRENT_TIMESTAMP`
          : `${field} = $${index + 1}`;
      })
      .join(", ");

    const query = `
      UPDATE users
      SET ${setClause}
      WHERE id = $${values.length + 1}
      RETURNING *
    `;

    values.push(id);
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.created_at, 
        u.updated_at,
        json_build_object(
          'id', r.id,
          'name', r.name,
          'description', r.description,
          'created_at', r.created_at,
          'updated_at', r.updated_at
        ) AS role
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll(limit = 10, offset = 0) {
    const query = `
      SELECT 
        u.id, u.username, u.email, u.created_at, u.updated_at,
        r.id AS role_id, r.name AS role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.id ASC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      email: row.email,
      created_at: row.created_at,
      updated_at: row.updated_at,
      role: {
        id: row.role_id,
        name: row.role_name,
      },
    }));
  }

  static async findAllNoLimit() {
    const query = `     
    SELECT 
        u.id, u.username, u.email, u.created_at, u.updated_at,
        r.id AS role_id, r.name AS role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.id ASC
    `;
    const result = await pool.query(query);
    return result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      email: row.email,
      created_at: row.created_at,
      updated_at: row.updated_at,
      role: {
        id: row.role_id,
        name: row.role_name,
      },
    }));
  }

  static async count() {
    const query = "SELECT COUNT(*) FROM users";
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  static async delete(id) {
    const query = "DELETE FROM users WHERE id = $1";
    await pool.query(query, [id]);
    return true;
  }
}

module.exports = User;
