// controllers/ReportController.js

const Report = require("../models/report");

const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

exports.generateProfitReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required" });
    }

    const reportData = await Report.getProfitReportData(startDate, endDate);

    let totalRevenue = 0;
    let totalCost = 0;
    const medicineReport = {};

    reportData.sales.forEach((sale) => {
      totalRevenue += parseFloat(sale.total_price);
      const medicineId = sale.medicine_id;
      if (!medicineReport[medicineId]) {
        medicineReport[medicineId] = {
          id: medicineId,
          name:
            reportData.medicines.find((m) => m.id === medicineId)?.name ||
            "Unknown",
          revenue: 0,
          cost: 0,
          profit: 0,
          quantitySold: 0,
        };
      }
      medicineReport[medicineId].revenue += parseFloat(sale.total_price);
      medicineReport[medicineId].quantitySold += parseInt(sale.quantity);
    });

    reportData.purchases.forEach((purchase) => {
      totalCost += parseFloat(purchase.total_price);
      const medicineId = purchase.medicine_id;
      if (medicineReport[medicineId]) {
        medicineReport[medicineId].cost += parseFloat(purchase.total_price);
      }
    });

    const totalProfit = totalRevenue - totalCost;

    Object.values(medicineReport).forEach((medicine) => {
      medicine.profit = medicine.revenue - medicine.cost;
    });

    res.status(200).json({
      startDate,
      endDate,
      totalRevenue: formatPrice(totalRevenue),
      totalCost: formatPrice(totalCost),
      totalProfit: formatPrice(totalProfit),
      medicineReport: Object.values(medicineReport),
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error generating report", details: error.message });
  }
};

exports.generateInventoryReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required" });
    }

    const reportData = await Report.getInventoryReportData(startDate, endDate);

    let totalRevenue = 0;
    let totalCost = 0;
    const inventoryMetrics = {};

    reportData.sales.forEach((sale) => {
      totalRevenue += parseFloat(sale.total_revenue);
      const medicineId = sale.medicine_id;
      if (!inventoryMetrics[medicineId]) {
        inventoryMetrics[medicineId] = {
          id: medicineId,
          name:
            reportData.inventory.find((m) => m.id === medicineId)?.name ||
            "Unknown",
          revenue: 0,
          cost: 0,
          profit: 0,
          quantitySold: 0,
          quantityPurchased: 0,
          currentStock: 0,
        };
      }
      inventoryMetrics[medicineId].revenue += parseFloat(sale.total_revenue);
      inventoryMetrics[medicineId].quantitySold += parseInt(sale.total_sold);
    });

    reportData.purchases.forEach((purchase) => {
      totalCost += parseFloat(purchase.total_cost);
      const medicineId = purchase.medicine_id;
      if (inventoryMetrics[medicineId]) {
        inventoryMetrics[medicineId].cost += parseFloat(purchase.total_cost);
        inventoryMetrics[medicineId].quantityPurchased += parseInt(
          purchase.total_purchased
        );
      }
    });

    reportData.inventory.forEach((item) => {
      if (inventoryMetrics[item.id]) {
        inventoryMetrics[item.id].currentStock = parseInt(item.stock_quantity);
      }
    });

    const totalProfit = totalRevenue - totalCost;

    Object.values(inventoryMetrics).forEach((medicine) => {
      medicine.profit = medicine.revenue - medicine.cost;
    });

    const topSellingMedicines = Object.values(inventoryMetrics)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    const lowStockAlerts = Object.values(inventoryMetrics)
      .filter((medicine) => medicine.currentStock < 10)
      .sort((a, b) => a.currentStock - b.currentStock);

    res.status(200).json({
      startDate,
      endDate,
      totalRevenue: formatPrice(totalRevenue),
      totalCost: formatPrice(totalCost),
      totalProfit: formatPrice(totalProfit),
      inventoryMetrics: Object.values(inventoryMetrics),
      topSellingMedicines,
      lowStockAlerts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error generating inventory report",
      details: error.message,
    });
  }
};

exports.generateExpirationReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required" });
    }

    const medicines = await Report.getExpirationReportData(startDate, endDate);

    const expirationMetrics = {
      expired: 0,
      expiringSoon: 0,
      valid: 0,
    };

    const medicineExpirationSummary = {};

    medicines.forEach((medicine) => {
      expirationMetrics[medicine.status.toLowerCase().replace(" ", "")] += 1;

      medicineExpirationSummary[medicine.medicine_id] = {
        id: medicine.medicine_id,
        name: medicine.medicine_name,
        stockQuantity: medicine.stock_quantity,
        expiryDate: medicine.expiry_date,
        status: medicine.status,
      };
    });

    const topExpiringMedicines = Object.values(medicineExpirationSummary)
      .filter((m) => m.status !== "Valid")
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
      .slice(0, 5);

    res.status(200).json({
      startDate,
      endDate,
      expirationMetrics,
      medicineExpirationSummary: Object.values(medicineExpirationSummary),
      topExpiringMedicines,
      medicines,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error generating expiration report",
      details: error.message,
    });
  }
};

exports.generateSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, userId, role } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required" });
    }

    const salesData = await Report.getSalesReportData(
      startDate,
      endDate,
      userId,
      role
    );

    const overallMetrics = {
      totalSales: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
    };

    const salesPerformance = {};

    salesData.forEach((sale) => {
      overallMetrics.totalSales += 1;
      overallMetrics.totalRevenue += parseFloat(sale.total_amount);

      if (!salesPerformance[sale.user_id]) {
        salesPerformance[sale.user_id] = {
          userId: sale.user_id,
          username: sale.salesperson_name,
          role: sale.role_name,
          totalSales: 0,
          totalRevenue: 0,
        };
      }

      salesPerformance[sale.user_id].totalSales += 1;
      salesPerformance[sale.user_id].totalRevenue += parseFloat(
        sale.total_amount
      );
    });

    overallMetrics.averageOrderValue =
      overallMetrics.totalRevenue / overallMetrics.totalSales;

    const sortedSalesPerformance = Object.values(salesPerformance).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    );

    res.status(200).json({
      startDate,
      endDate,
      userId: userId || "all",
      role: role || "all",
      overallMetrics: {
        totalSales: overallMetrics.totalSales,
        totalRevenue: formatPrice(overallMetrics.totalRevenue),
        averageOrderValue: formatPrice(overallMetrics.averageOrderValue),
      },
      salesPerformance: sortedSalesPerformance,
      salesData,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error generating sales report", details: error.message });
  }
};
