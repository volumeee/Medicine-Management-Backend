const pool = require("../config/database");

class SaleItem {
  static async create(saleItemData) {
    const {
      sale_id,
      medicine_id,
      quantity,
      unit_price,
      total_price,
      medicine_name,
    } = saleItemData;
    const query = `
      INSERT INTO sale_items (sale_id, medicine_id, quantity, unit_price, total_price, medicine_name)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      sale_id,
      medicine_id,
      quantity,
      unit_price,
      total_price,
      medicine_name,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findBySaleId(saleId) {
    const query = `
      SELECT si.*, m.name as medicine_name
      FROM sale_items si
      JOIN medicines m ON si.medicine_id = m.id
      WHERE si.sale_id = $1
    `;
    const result = await pool.query(query, [saleId]);
    return result.rows;
  }

  static async deleteBySaleId(saleId) {
    const query = "DELETE FROM sale_items WHERE sale_id = $1";
    await pool.query(query, [saleId]);
    return true;
  }
}

module.exports = SaleItem;
