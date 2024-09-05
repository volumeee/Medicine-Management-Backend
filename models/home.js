// models/home.js

const pool = require("../config/database");
const moment = require("moment-timezone");

class Home {
  static async getTotalMedicines() {
    const query = `
      SELECT COUNT(*) AS total_medicines
      FROM medicines
    `;
    const result = await pool.query(query);
    return result.rows[0].total_medicines;
  }

  static async getTotalStock() {
    const query = `
      SELECT SUM(stock_quantity) AS total_stock
      FROM medicines
    `;
    const result = await pool.query(query);
    return result.rows[0].total_stock;
  }

  static async getTotalSales(startDate, endDate) {
    const currentPeriodQuery = `
    SELECT COUNT(*) AS total_sales_count, COALESCE(SUM(total_amount), 0) AS total_sales_amount
    FROM sales
    WHERE sale_date BETWEEN $1 AND $2
  `;

    const previousPeriodQuery = `
    SELECT COUNT(*) AS total_sales_count, COALESCE(SUM(total_amount), 0) AS total_sales_amount
    FROM sales
    WHERE sale_date BETWEEN $1 AND $2
  `;

    const currentResult = await pool.query(currentPeriodQuery, [
      startDate,
      endDate,
    ]);

    const periodDuration = moment(endDate).diff(moment(startDate), "days");
    const previousStartDate = moment(startDate)
      .subtract(periodDuration, "days")
      .format("YYYY-MM-DD");
    const previousEndDate = moment(startDate)
      .subtract(1, "day")
      .format("YYYY-MM-DD");

    const previousResult = await pool.query(previousPeriodQuery, [
      previousStartDate,
      previousEndDate,
    ]);

    const currentSalesCount = parseInt(currentResult.rows[0].total_sales_count);
    const currentSalesAmount = parseFloat(
      currentResult.rows[0].total_sales_amount
    );
    const previousSalesCount = parseInt(
      previousResult.rows[0].total_sales_count
    );
    const previousSalesAmount = parseFloat(
      previousResult.rows[0].total_sales_amount
    );

    const percentageChangeCount =
      previousSalesCount !== 0
        ? ((currentSalesCount - previousSalesCount) / previousSalesCount) * 100
        : currentSalesCount > 0
        ? 100
        : 0;

    const percentageChangeAmount =
      previousSalesAmount !== 0
        ? ((currentSalesAmount - previousSalesAmount) / previousSalesAmount) *
          100
        : currentSalesAmount > 0
        ? 100
        : 0;

    return {
      totalSalesCount: currentSalesCount.toString(),
      totalSalesAmount: currentSalesAmount.toFixed(2),
      percentageChangeCount: Number(percentageChangeCount.toFixed(2)),
      percentageChangeAmount: Number(percentageChangeAmount.toFixed(2)),
    };
  }

  static async getTotalProfit(startDate, endDate) {
    const currentPeriodQuery = `
    SELECT 
      COALESCE(SUM(s.total_amount - (si.quantity * m.price)), 0) AS total_profit_actual,
      COALESCE(SUM(s.total_amount - (si.quantity * m.recommended_price)), 0) AS total_profit_recommended
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    JOIN medicines m ON si.medicine_id = m.id
    WHERE s.sale_date BETWEEN $1 AND $2
    `;

    const previousPeriodQuery = `
    SELECT 
      COALESCE(SUM(s.total_amount - (si.quantity * m.price)), 0) AS total_profit_actual,
      COALESCE(SUM(s.total_amount - (si.quantity * m.recommended_price)), 0) AS total_profit_recommended
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    JOIN medicines m ON si.medicine_id = m.id
    WHERE s.sale_date BETWEEN $1 AND $2
    `;

    const currentResult = await pool.query(currentPeriodQuery, [
      startDate,
      endDate,
    ]);

    const periodDuration = moment(endDate).diff(moment(startDate), "days");
    const previousStartDate = moment(startDate)
      .subtract(periodDuration, "days")
      .format("YYYY-MM-DD");
    const previousEndDate = moment(startDate)
      .subtract(1, "day")
      .format("YYYY-MM-DD");

    const previousResult = await pool.query(previousPeriodQuery, [
      previousStartDate,
      previousEndDate,
    ]);

    const currentProfitActual = parseFloat(
      currentResult.rows[0].total_profit_actual
    );
    const currentProfitRecommended = parseFloat(
      currentResult.rows[0].total_profit_recommended
    );
    const previousProfitActual = parseFloat(
      previousResult.rows[0].total_profit_actual
    );
    const previousProfitRecommended = parseFloat(
      previousResult.rows[0].total_profit_recommended
    );

    const percentageChangeActual =
      previousProfitActual !== 0
        ? ((currentProfitActual - previousProfitActual) /
            previousProfitActual) *
          100
        : currentProfitActual > 0
        ? 100
        : 0;

    const percentageChangeRecommended =
      previousProfitRecommended !== 0
        ? ((currentProfitRecommended - previousProfitRecommended) /
            previousProfitRecommended) *
          100
        : currentProfitRecommended > 0
        ? 100
        : 0;

    return {
      totalProfitActual: currentProfitActual.toFixed(2),
      totalProfitRecommended: currentProfitRecommended.toFixed(2),
      percentageChangeActual: Number(percentageChangeActual.toFixed(2)),
      percentageChangeRecommended: Number(
        percentageChangeRecommended.toFixed(2)
      ),
    };
  }

  static async getTotalExpenses(startDate, endDate) {
    const currentPeriodQuery = `
      SELECT COALESCE(SUM(total_amount), 0) AS total_expenses
      FROM purchases 
      WHERE purchase_date BETWEEN $1 AND $2
    `;

    const previousPeriodQuery = `
      SELECT COALESCE(SUM(total_amount), 0) AS total_expenses
      FROM purchases 
      WHERE purchase_date BETWEEN $1 AND $2
    `;

    const currentResult = await pool.query(currentPeriodQuery, [
      startDate,
      endDate,
    ]);

    const periodDuration = moment(endDate).diff(moment(startDate), "days");
    const previousStartDate = moment(startDate)
      .subtract(periodDuration, "days")
      .format("YYYY-MM-DD");
    const previousEndDate = moment(startDate)
      .subtract(1, "day")
      .format("YYYY-MM-DD");

    const previousResult = await pool.query(previousPeriodQuery, [
      previousStartDate,
      previousEndDate,
    ]);

    const currentExpenses = parseFloat(currentResult.rows[0].total_expenses);
    const previousExpenses = parseFloat(previousResult.rows[0].total_expenses);

    const percentageChange =
      previousExpenses !== 0
        ? ((currentExpenses - previousExpenses) / previousExpenses) * 100
        : 100;

    return {
      totalExpenses: currentExpenses.toFixed(2),
      percentageChange: Number(percentageChange.toFixed(2)),
    };
  }

  static async getTotalRevenue(startDate, endDate) {
    const currentPeriodQuery = `
    SELECT COALESCE(SUM(total_amount), 0) AS total_revenue
    FROM sales 
    WHERE sale_date BETWEEN $1 AND $2
  `;

    const previousPeriodQuery = `
    SELECT COALESCE(SUM(total_amount), 0) AS total_revenue
    FROM sales 
    WHERE sale_date BETWEEN $1 AND $2
  `;

    const currentResult = await pool.query(currentPeriodQuery, [
      startDate,
      endDate,
    ]);

    const periodDuration = moment(endDate).diff(moment(startDate), "days");
    const previousStartDate = moment(startDate)
      .subtract(periodDuration, "days")
      .format("YYYY-MM-DD");
    const previousEndDate = moment(startDate)
      .subtract(1, "day")
      .format("YYYY-MM-DD");

    const previousResult = await pool.query(previousPeriodQuery, [
      previousStartDate,
      previousEndDate,
    ]);

    const currentRevenue = parseFloat(currentResult.rows[0].total_revenue);
    const previousRevenue = parseFloat(previousResult.rows[0].total_revenue);

    const percentageChange =
      previousRevenue !== 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : currentRevenue > 0
        ? 100
        : 0;

    return {
      totalRevenue: currentRevenue.toFixed(2),
      percentageChange: Number(percentageChange.toFixed(2)),
    };
  }

  static async getTotalSuppliers() {
    const query = `
      SELECT COUNT(*) AS total_suppliers
      FROM suppliers
    `;
    const result = await pool.query(query);
    return result.rows[0].total_suppliers;
  }

  static async getLowStockMedicines() {
    const query = `
      SELECT COUNT(*) AS low_stock_count
      FROM medicines
      WHERE stock_quantity <= 10
    `;
    const result = await pool.query(query);
    return result.rows[0].low_stock_count;
  }

  static async getExpiringMedicines() {
    const query = `
      SELECT COUNT(*) AS expiring_count
      FROM medicines
      WHERE expiry_date <= (CURRENT_DATE + INTERVAL '30 days')
    `;
    const result = await pool.query(query);
    return result.rows[0].expiring_count;
  }

  static async getPharmacistRank(limit = 10, offset = 0) {
    const query = `
      SELECT 
        u.id,
        u.username AS pharmacist_name,
        COUNT(s.id) AS total_sales,
        SUM(s.total_amount) AS total_amount
      FROM 
        users u
        JOIN sales s ON u.id = s.user_id
      GROUP BY 
        u.id
      ORDER BY 
        total_amount DESC
      LIMIT $1 OFFSET $2
    `;
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) AS total
      FROM users u
      JOIN sales s ON u.id = s.user_id
    `;
    const result = await pool.query(query, [limit, offset]);
    const countResult = await pool.query(countQuery);
    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].total),
    };
  }

  static async getRecentPurchases(limit = 10, offset = 0) {
    const query = `
      SELECT 
        p.id, 
        DATE(p.purchase_date) AS purchase_date, 
        s.name AS supplier_name, 
        p.total_amount
      FROM 
        purchases p
        JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY 
        p.purchase_date DESC
      LIMIT $1 OFFSET $2
    `;
    const countQuery = `SELECT COUNT(*) AS total FROM purchases`;
    const result = await pool.query(query, [limit, offset]);
    const countResult = await pool.query(countQuery);
    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].total),
    };
  }

  static async getAverageSaleValue(startDate, endDate) {
    const query = `
      SELECT 
        COALESCE(AVG(total_amount), 0) AS average_sale_value
      FROM sales
      WHERE sale_date BETWEEN $1 AND $2
    `;

    const result = await pool.query(query, [startDate, endDate]);
    return parseFloat(result.rows[0].average_sale_value).toFixed(2);
  }

  static async getRecentSales(limit = 10, offset = 0) {
    const query = `
      SELECT 
        s.id, 
        DATE(s.sale_date) AS sale_date, 
        u.username AS pharmacist_name, 
        s.total_amount
      FROM 
        sales s
        JOIN users u ON s.user_id = u.id
      ORDER BY 
        s.sale_date DESC
      LIMIT $1 OFFSET $2
    `;
    const countQuery = `SELECT COUNT(*) AS total FROM sales`;
    const result = await pool.query(query, [limit, offset]);
    const countResult = await pool.query(countQuery);
    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].total),
    };
  }

  static async getSupplierRank(limit = 10, offset = 0) {
    const query = `
      SELECT 
        s.id,
        s.name AS supplier_name,
        COUNT(p.id) AS order_count
      FROM 
        suppliers s
        LEFT JOIN purchases p ON s.id = p.supplier_id
      GROUP BY 
        s.id
      ORDER BY 
        order_count DESC
      LIMIT $1 OFFSET $2
    `;
    const countQuery = `SELECT COUNT(*) AS total FROM suppliers`;
    const result = await pool.query(query, [limit, offset]);
    const countResult = await pool.query(countQuery);
    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].total),
    };
  }

  static async getProfitChart(startDate, endDate) {
    const query = `
    SELECT 
      DATE(s.sale_date) AS date,
      SUM(s.total_amount - (si.quantity * m.recommended_price)) AS daily_profit
    FROM 
      sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN medicines m ON si.medicine_id = m.id
    WHERE 
      s.sale_date >= $1::date 
      AND s.sale_date < ($2::date + INTERVAL '1 day')
    GROUP BY 
      DATE(s.sale_date)
    ORDER BY 
      date
    `;
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  }

  static async getExpensesChart(startDate, endDate) {
    const query = `
    SELECT 
      DATE(p.purchase_date) AS date,
      SUM(p.total_amount) AS daily_expenses
    FROM 
      purchases p
    WHERE 
      p.purchase_date >= $1::date
      AND p.purchase_date < ($2::date + INTERVAL '1 day')
    GROUP BY 
      DATE(p.purchase_date)
    ORDER BY 
      date
    `;
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  }

  static async getBestSellingMedicines(startDate, endDate) {
    const query = `
      SELECT 
        m.id,
        m.name AS medicine_name,
        SUM(si.quantity) AS total_quantity_sold,
        SUM(si.total_price) AS total_sales_amount
      FROM 
        sale_items si
        JOIN medicines m ON si.medicine_id = m.id
        JOIN sales s ON si.sale_id = s.id
      WHERE 
        s.sale_date BETWEEN $1 AND $2
      GROUP BY 
        m.id, m.name
      ORDER BY 
        total_quantity_sold DESC
      LIMIT 5
    `;
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  }
}

module.exports = Home;
