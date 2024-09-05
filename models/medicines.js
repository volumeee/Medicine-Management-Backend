const pool = require("../config/database");

class Medicine {
  static async create(medicineData) {
    const fields = Object.keys(medicineData);
    const values = Object.values(medicineData);

    const placeholders = fields.map((_, index) => `$${index + 1}`).join(", ");
    const query = `INSERT INTO medicines (${fields.join(
      ", "
    )}) VALUES (${placeholders}) RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id, updateData) {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    let setClause = fields
      .map((field, index) => `${field} = $${index + 1}`)
      .join(", ");
    const query = `UPDATE medicines SET ${setClause} WHERE id = $${
      fields.length + 1
    } RETURNING *`;

    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = "DELETE FROM medicines WHERE id = $1";
    await pool.query(query, [id]);
    return true;
  }

  static async findById(id) {
    const query = "SELECT * FROM medicines WHERE id = $1";
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }

  static async findAll(limit = 10, offset = 0) {
    const query =
      "SELECT * FROM medicines ORDER BY id DESC LIMIT $1 OFFSET $2 ";
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async findAllNoLimit() {
    const query = "SELECT * FROM medicines";
    const result = await pool.query(query);
    return result.rows;
  }

  static async count() {
    const query = "SELECT COUNT(*) FROM medicines";
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Medicine;
