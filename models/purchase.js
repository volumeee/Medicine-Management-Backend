const pool = require("../config/database");

class Purchase {
  static async create(purchaseData) {
    const { supplier_id, supplier_name, purchase_date, status } = purchaseData;
    const query = `
        INSERT INTO purchases (supplier_id, supplier_name, purchase_date, total_amount, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    `;
    const values = [supplier_id, supplier_name, purchase_date, 0, status];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async update(id, updateData) {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields
      .map((field, index) => `${field} = $${index + 1}`)
      .join(", ");
    const query = `
      UPDATE purchases
      SET ${setClause}
      WHERE id = $${fields.length + 1}
      RETURNING *
    `;
    values.push(id);
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = `
      DELETE FROM purchases
      WHERE id = $1
      RETURNING *
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT p.*, s.name AS supplier_name
      FROM purchases p
      INNER JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async findAll(limit = 10, offset = 0) {
    const query = `
    SELECT 
      p.id,
      p.supplier_id,
      TO_CHAR(p.purchase_date, 'YYYY-MM-DD') AS purchase_date,
      p.total_amount,
      s.name AS supplier_name
    FROM purchases p
    INNER JOIN suppliers s ON p.supplier_id = s.id
    ORDER BY p.purchase_date DESC
    LIMIT $1 OFFSET $2
  `;
    const { rows } = await pool.query(query, [limit, offset]);
    return rows;
  }

  static async count() {
    const query = "SELECT COUNT(*) FROM purchases";
    const { rows } = await pool.query(query);
    return parseInt(rows[0].count, 10);
  }
}

module.exports = Purchase;
