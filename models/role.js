const pool = require("../config/database");

class Role {
  static async create(name, description) {
    const query =
      "INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING *";
    const values = [name, description];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = "SELECT * FROM roles WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByName(name) {
    const query = "SELECT * FROM roles WHERE name = $1";
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }
}

module.exports = Role;
