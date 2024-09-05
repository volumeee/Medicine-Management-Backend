const pool = require("../config/database");

class PurchaseItem {
  static async create(purchaseItemData) {
    const { purchase_id, medicine_id, medicine_name, quantity, unit_price } =
      purchaseItemData;
    const total_price = quantity * unit_price;
    const query = `
      INSERT INTO purchase_items (purchase_id, medicine_id, medicine_name, quantity, unit_price, total_price)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    const values = [
      purchase_id,
      medicine_id,
      medicine_name,
      quantity,
      unit_price,
      total_price,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByPurchaseId(purchaseId) {
    const query = `
      SELECT pi.*, m.name AS medicine_name 
      FROM purchase_items pi 
      INNER JOIN medicines m ON pi.medicine_id = m.id 
      WHERE pi.purchase_id = $1
    `;
    const result = await pool.query(query, [purchaseId]);
    return result.rows;
  }

  static async deletePurchaseItems(purchaseId) {
    const query = "DELETE FROM purchase_items WHERE purchase_id = $1";
    await pool.query(query, [purchaseId]);
    return true;
  }
}

module.exports = PurchaseItem;
