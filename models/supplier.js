const pool = require("../config/database");

class Supplier {
  static async create(supplierData) {
    const { name, contact_person, email, phone, address } = supplierData;
    const query = `
      INSERT INTO suppliers (name, contact_person, email, phone, address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [name, contact_person, email, phone, address];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = "SELECT * FROM suppliers WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll(limit = 10, offset = 0) {
    const query = "SELECT * FROM suppliers ORDER BY id ASC LIMIT $1 OFFSET $2";
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async FindAllNoLimit() {
    const query = "SELECT * FROM suppliers ORDER BY id ASC";
    const result = await pool.query(query);
    return result.rows;
  }

  static async count() {
    const query = "SELECT COUNT(*) FROM suppliers";
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  static async update(id, updateData) {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields
      .map((field, index) => `${field} = $${index + 1}`)
      .join(", ");
    const query = `UPDATE suppliers SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${
      fields.length + 1
    } RETURNING *`;
    values.push(id);
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = "DELETE FROM suppliers WHERE id = $1";
    await pool.query(query, [id]);
    return true;
  }

  static async count() {
    const query = "SELECT COUNT(*) FROM suppliers";
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Supplier;
