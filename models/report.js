// models/report.js

const pool = require("../config/database");

const Report = {
  async getProfitReportData(startDate, endDate) {
    const client = await pool.connect();
    try {
      const salesQuery = `
        SELECT s.id, s.sale_date, s.total_amount, si.medicine_id, si.quantity, si.unit_price, si.total_price
        FROM sales s
        JOIN sale_items si ON s.id = si.sale_id
        WHERE s.sale_date BETWEEN $1 AND $2
      `;
      const salesResult = await client.query(salesQuery, [startDate, endDate]);

      const purchasesQuery = `
        SELECT p.id, p.purchase_date, p.total_amount, pi.medicine_id, pi.quantity, pi.unit_price, pi.total_price
        FROM purchases p
        JOIN purchase_items pi ON p.id = pi.purchase_id
        WHERE p.purchase_date BETWEEN $1 AND $2
      `;
      const purchasesResult = await client.query(purchasesQuery, [
        startDate,
        endDate,
      ]);

      const medicineIds = [
        ...new Set([
          ...salesResult.rows.map((s) => s.medicine_id),
          ...purchasesResult.rows.map((p) => p.medicine_id),
        ]),
      ];

      const medicinesQuery = `SELECT id, name FROM medicines WHERE id = ANY($1)`;
      const medicinesResult = await client.query(medicinesQuery, [medicineIds]);

      return {
        sales: salesResult.rows,
        purchases: purchasesResult.rows,
        medicines: medicinesResult.rows,
      };
    } finally {
      client.release();
    }
  },

  async getInventoryReportData(startDate, endDate) {
    const client = await pool.connect();
    try {
      const salesQuery = `
        SELECT si.medicine_id, SUM(si.quantity) as total_sold, SUM(si.total_price) as total_revenue
        FROM sales s
        JOIN sale_items si ON s.id = si.sale_id
        WHERE s.sale_date BETWEEN $1 AND $2
        GROUP BY si.medicine_id
      `;
      const salesResult = await client.query(salesQuery, [startDate, endDate]);

      const purchasesQuery = `
        SELECT pi.medicine_id, SUM(pi.quantity) as total_purchased, SUM(pi.total_price) as total_cost
        FROM purchases p
        JOIN purchase_items pi ON p.id = pi.purchase_id
        WHERE p.purchase_date BETWEEN $1 AND $2
        GROUP BY pi.medicine_id
      `;
      const purchasesResult = await client.query(purchasesQuery, [
        startDate,
        endDate,
      ]);

      const inventoryQuery = `
        SELECT id, name, stock_quantity, price
        FROM medicines
      `;
      const inventoryResult = await client.query(inventoryQuery);

      return {
        sales: salesResult.rows,
        purchases: purchasesResult.rows,
        inventory: inventoryResult.rows,
      };
    } finally {
      client.release();
    }
  },

  async getExpirationReportData(startDate, endDate) {
    const client = await pool.connect();
    try {
      const medicineQuery = `
        SELECT id AS medicine_id, name AS medicine_name, 
               stock_quantity, expiry_date,
               CASE 
                 WHEN expiry_date <= CURRENT_DATE THEN 'Expired'
                 WHEN expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Expiring Soon'
                 ELSE 'Valid'
               END AS status
        FROM medicines
        WHERE expiry_date BETWEEN $1 AND $2
        ORDER BY expiry_date ASC
      `;
      const medicineResult = await client.query(medicineQuery, [
        startDate,
        endDate,
      ]);

      return medicineResult.rows;
    } finally {
      client.release();
    }
  },

  async getSalesReportData(startDate, endDate, userId, role) {
    const client = await pool.connect();
    try {
      let salesQuery = `
        SELECT s.id AS sale_id, s.sale_date, s.total_amount,
               u.id AS user_id, u.username AS salesperson_name,
               r.name AS role_name,
               si.medicine_id, m.name AS medicine_name,
               si.quantity, si.unit_price, si.total_price,
               m.price AS current_unit_price
        FROM sales s
        JOIN users u ON s.user_id = u.id
        JOIN roles r ON u.role_id = r.id
        JOIN sale_items si ON s.id = si.sale_id
        JOIN medicines m ON si.medicine_id = m.id
        WHERE s.sale_date BETWEEN $1 AND $2
      `;

      const queryParams = [startDate, endDate];

      if (userId) {
        salesQuery += " AND u.id = $" + (queryParams.length + 1);
        queryParams.push(userId);
      }

      if (role) {
        salesQuery += " AND r.name = $" + (queryParams.length + 1);
        queryParams.push(role);
      }

      salesQuery += " ORDER BY s.sale_date ASC, u.username ASC";

      const salesResult = await client.query(salesQuery, queryParams);

      return salesResult.rows;
    } finally {
      client.release();
    }
  },
};

module.exports = Report;
