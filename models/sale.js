const pool = require("../config/database");

class Sale {
  static async create(saleData) {
    const { sale_date, customer_name, cashier, status, total_amount, user_id } =
      saleData;
    const query = `
      INSERT INTO sales (sale_date, customer_name, cashier, status, total_amount, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      sale_date,
      customer_name,
      cashier,
      status,
      total_amount,
      user_id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT s.*, u.username
      FROM sales s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll(limit = 10, offset = 0) {
    const query = `
      SELECT s.*, u.username
      FROM sales s
      JOIN users u ON s.user_id = u.id ORDER BY s.id ASC LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async count() {
    const query = "SELECT COUNT(*) FROM sales";
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  static async update(id, updateData) {
    const { sale_date, customer_name, status, total_amount } = updateData;
    const query = `
    UPDATE sales
    SET sale_date = $1, customer_name = $2, status = $3, total_amount = $4, updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *
  `;
    const values = [sale_date, customer_name, status, total_amount, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = "DELETE FROM sales WHERE id = $1";
    await pool.query(query, [id]);
    return true;
  }
}

module.exports = Sale;
