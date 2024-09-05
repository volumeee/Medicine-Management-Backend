// controllers/homeController.js

const Home = require("../models/home");
const moment = require("moment-timezone");
const { formatDate } = require("../utils/dateFormatter");
exports.getHomeDashboard = async (req, res) => {
  try {
    let {
      startDate,
      endDate,
      limit,
      pharmacistPage,
      supplierPage,
      purchasesPage,
      salesPage,
    } = req.query;

    limit = parseInt(limit) || 5;
    pharmacistPage = parseInt(pharmacistPage) || 1;
    supplierPage = parseInt(supplierPage) || 1;
    purchasesPage = parseInt(purchasesPage) || 1;
    salesPage = parseInt(salesPage) || 1;

    const pharmacistOffset = (pharmacistPage - 1) * limit;
    const supplierOffset = (supplierPage - 1) * limit;
    const purchasesOffset = (purchasesPage - 1) * limit;
    const salesOffset = (salesPage - 1) * limit;

    if (!startDate || !endDate) {
      endDate = moment().tz("Asia/Jakarta").format("YYYY-MM-DD");
      startDate = moment()
        .tz("Asia/Jakarta")
        .subtract(30, "days")
        .format("YYYY-MM-DD");
    }

    const totalMedicines = await Home.getTotalMedicines();
    const totalStock = await Home.getTotalStock();
    const salesResult = await Home.getTotalSales(startDate, endDate);
    const profitResult = await Home.getTotalProfit(startDate, endDate);
    const expensesResult = await Home.getTotalExpenses(startDate, endDate);
    const revenueResult = await Home.getTotalRevenue(startDate, endDate);
    const averageSaleValue = await Home.getAverageSaleValue(startDate, endDate);
    const totalSuppliers = await Home.getTotalSuppliers();
    const lowStockCount = await Home.getLowStockMedicines();
    const expiringCount = await Home.getExpiringMedicines();
    const pharmacistRank = await Home.getPharmacistRank(
      limit,
      pharmacistOffset
    );
    const recentPurchases = await Home.getRecentPurchases(
      limit,
      purchasesOffset
    );
    const recentSales = await Home.getRecentSales(limit, salesOffset);
    const supplierRank = await Home.getSupplierRank(limit, supplierOffset);
    const profitChart = await Home.getProfitChart(startDate, endDate);
    const expensesChart = await Home.getExpensesChart(startDate, endDate);
    const bestSellingMedicines = await Home.getBestSellingMedicines(
      startDate,
      endDate
    );

    const formattedProfitChart = profitChart.map((item) => ({
      ...item,
      date: formatDate(item.date),
    }));

    const formattedExpensesChart = expensesChart.map((item) => ({
      ...item,
      date: formatDate(item.date),
    }));

    const formattedRecentPurchases = recentPurchases.data.map((item) => ({
      ...item,
      purchase_date: formatDate(item.purchase_date),
    }));

    const formattedRecentSales = recentSales.data.map((item) => ({
      ...item,
      sale_date: formatDate(item.sale_date),
    }));

    res.status(200).json({
      status: 200,
      error: false,
      message: "Success",
      data: {
        cardData: {
          totalMedicines,
          totalStock,
          totalSalesCount: salesResult.totalSalesCount,
          totalSalesAmount: salesResult.totalSalesAmount,
          salesPercentageChangeCount: salesResult.percentageChangeCount,
          salesPercentageChangeAmount: salesResult.percentageChangeAmount,
          totalProfitActual: profitResult.totalProfitActual,
          profitPercentageChangeActual: profitResult.percentageChangeActual,
          totalProfitRecommended: profitResult.totalProfitRecommended,
          profitPercentageChangeRecommended:
            profitResult.percentageChangeRecommended,
          totalExpenses: expensesResult.totalExpenses,
          expensesPercentageChange: expensesResult.percentageChange,
          totalRevenue: revenueResult.totalRevenue,
          revenuePercentageChange: revenueResult.percentageChange,
          averageSaleValue,
          totalSuppliers,
          lowStockCount,
          expiringCount,
        },
        rankData: {
          pharmacistRank: {
            meta: {
              total: pharmacistRank.total,
            },
            page: {
              current: pharmacistPage,
              total: Math.ceil(pharmacistRank.total / limit),
              size: limit,
            },
            data: pharmacistRank.data,
          },
          supplierRank: {
            meta: {
              total: supplierRank.total,
            },
            page: {
              current: supplierPage,
              total: Math.ceil(supplierRank.total / limit),
              size: limit,
            },
            data: supplierRank.data,
          },
        },
        recentData: {
          recentPurchases: {
            meta: {
              total: recentPurchases.total,
            },
            page: {
              current: purchasesPage,
              total: Math.ceil(recentPurchases.total / limit),
              size: limit,
            },
            data: formattedRecentPurchases,
          },
          recentSales: {
            meta: {
              total: recentSales.total,
            },
            page: {
              current: salesPage,
              total: Math.ceil(recentSales.total / limit),
              size: limit,
            },
            data: formattedRecentSales,
          },
        },
        charts: {
          formattedProfitChart,
          formattedExpensesChart,
        },
        bestSellingMedicines,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      error: true,
      message: "Error fetching dashboard data",
      details: error.message,
    });
  }
};
