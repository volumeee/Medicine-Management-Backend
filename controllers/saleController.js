const Sale = require("../models/sale");
const SaleItem = require("../models/saleItem");
const Medicine = require("../models/medicines");
const User = require("../models/user");
const pool = require("../config/database");

exports.getAllSales = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const totalCount = await Sale.count();
    const sales = await Sale.findAll(limit, offset);
    const salesWithDetails = [];

    for (const sale of sales) {
      const saleItems = await SaleItem.findBySaleId(sale.id);
      const user = await User.findById(sale.user_id);
      const saleDetails = [];

      for (const item of saleItems) {
        saleDetails.push({
          medicine_id: item.medicine_id,
          name: item.medicine_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        });
      }

      salesWithDetails.push({
        id: sale.id,
        customer_name: sale.customer_name,
        sale_date: sale.sale_date,
        status: sale.status,
        total_amount: sale.total_amount,
        cashier: user.username,
        items: saleDetails,
      });
    }

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      status: 200,
      error: false,
      message: "Success",
      data: {
        meta: {
          total: totalCount,
        },
        page: {
          current: page,
          total: totalPages,
          size: limit,
        },
        data: salesWithDetails,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      error: true,
      message: "Error fetching sales",
      data: null,
    });
  }
};

exports.createSale = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { sale_date, customer_name, status, items } = req.body;
    const user_id = req.user.id;
    const user = await User.findById(user_id);

    let totalAmount = 0;
    const saleItems = [];

    for (const item of items) {
      const { medicine_id, quantity } = item;
      const medicine = await Medicine.findById(medicine_id);

      if (!medicine) {
        throw new Error(`Medicine with id ${medicine_id} not found`);
      }

      if (medicine.stock_quantity < quantity) {
        throw new Error(`Insufficient stock for medicine ${medicine.name}`);
      }

      const itemTotalPrice = parseFloat(
        (medicine.recommended_price * quantity).toFixed(2)
      );
      totalAmount += itemTotalPrice;

      saleItems.push({
        medicine_id,
        quantity,
        unit_price: medicine.recommended_price,
        total_price: itemTotalPrice,
        medicine_name: medicine.name,
      });

      await Medicine.update(medicine_id, {
        stock_quantity: medicine.stock_quantity - quantity,
      });
    }

    const sale = await Sale.create({
      sale_date,
      customer_name,
      status,
      total_amount: parseFloat(totalAmount.toFixed(2)),
      user_id,
      cashier: user.username,
    });

    for (const item of saleItems) {
      await SaleItem.create({
        sale_id: sale.id,
        ...item,
      });
    }

    await client.query("COMMIT");

    const saleWithItems = await Sale.findById(sale.id);
    const saleItemsDetails = await SaleItem.findBySaleId(sale.id);

    const username = (await User.findById(user_id)).username;

    const { created_at, updated_at, ...saleWithoutTimestamps } = saleWithItems;

    res.status(201).json({
      status: 201,
      error: false,
      message: "Sale created successfully",
      data: {
        sale: {
          ...saleWithoutTimestamps,
          cashier: username,
          items: saleItemsDetails.map((item) => ({
            id: item.id,
            sale_id: item.sale_id,
            medicine_id: item.medicine_id,
            medicine_name: item.medicine_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            created_at: item.created_at,
            updated_at: item.updated_at,
          })),
        },
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({
      status: 500,
      error: true,
      message: "Error creating sale",
      data: null,
    });
  } finally {
    client.release();
  }
};

exports.updateSale = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const { sale_date, customer_name, status, items } = req.body;
    const user_id = req.user.id;

    const existingSale = await Sale.findById(id);
    if (!existingSale) {
      return res.status(404).json({
        status: 404,
        error: true,
        message: "Sale not found",
        data: null,
      });
    }

    let totalAmount = 0;
    const saleItems = [];

    // Reverse previous stock changes
    const oldSaleItems = await SaleItem.findBySaleId(id);
    for (const item of oldSaleItems) {
      const medicine = await Medicine.findById(item.medicine_id);
      await Medicine.update(item.medicine_id, {
        stock_quantity: medicine.stock_quantity + item.quantity,
      });
    }

    // Process new items
    for (const item of items) {
      const { medicine_id, quantity } = item;
      const medicine = await Medicine.findById(medicine_id);

      if (!medicine) {
        throw new Error(`Medicine with id ${medicine_id} not found`);
      }

      if (medicine.stock_quantity < quantity) {
        throw new Error(`Insufficient stock for medicine ${medicine.name}`);
      }

      const itemTotalPrice = parseFloat(
        (medicine.recommended_price * quantity).toFixed(2)
      );
      totalAmount += itemTotalPrice;

      saleItems.push({
        medicine_id,
        quantity,
        unit_price: medicine.recommended_price,
        total_price: itemTotalPrice,
        medicine_name: medicine.name,
      });

      await Medicine.update(medicine_id, {
        stock_quantity: medicine.stock_quantity - quantity,
      });
    }

    // Update sale
    const updatedSale = await Sale.update(id, {
      sale_date,
      customer_name,
      status,
      total_amount: parseFloat(totalAmount.toFixed(2)),
      user_id,
    });

    // Delete old sale items and create new ones
    await SaleItem.deleteBySaleId(id);
    for (const item of saleItems) {
      await SaleItem.create({
        sale_id: id,
        ...item,
      });
    }

    await client.query("COMMIT");

    const saleWithItems = await Sale.findById(id);
    const saleItemsDetails = await SaleItem.findBySaleId(id);

    const username = (await User.findById(user_id)).username;

    const { created_at, updated_at, ...saleWithoutTimestamps } = saleWithItems;

    res.status(200).json({
      status: 200,
      error: false,
      message: "Sale updated successfully",
      data: {
        sale: {
          ...saleWithoutTimestamps,
          cashier: username,
          items: saleItemsDetails.map((item) => ({
            id: item.id,
            sale_id: item.sale_id,
            medicine_id: item.medicine_id,
            medicine_name: item.medicine_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            created_at: item.created_at,
            updated_at: item.updated_at,
          })),
        },
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({
      status: 500,
      error: true,
      message: "Error updating sale",
      data: null,
    });
  } finally {
    client.release();
  }
};

exports.findSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findById(id);

    if (!sale) {
      return res.status(404).json({
        status: 404,
        error: true,
        message: "Sale not found",
        data: null,
      });
    }

    const saleItems = await SaleItem.findBySaleId(id);
    const user = await User.findById(sale.user_id);

    const { created_at, updated_at, ...saleWithoutTimestamps } = sale;

    res.status(200).json({
      status: 200,
      error: false,
      message: "Sale found successfully",

      sale: {
        ...saleWithoutTimestamps,
        cashier: user.username,
        items: saleItems.map((item) => ({
          id: item.id,
          sale_id: item.sale_id,
          medicine_id: item.medicine_id,
          medicine_name: item.medicine_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          created_at: item.created_at,
          updated_at: item.updated_at,
        })),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      error: true,
      message: "Error fetching sale",
      data: null,
    });
  }
};

exports.deleteSale = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const sale = await Sale.findById(id);

    if (!sale) {
      return res.status(404).json({
        status: 404,
        error: true,
        message: "Sale not found",
        data: null,
      });
    }

    // Reverse stock changes
    const saleItems = await SaleItem.findBySaleId(id);
    for (const item of saleItems) {
      const medicine = await Medicine.findById(item.medicine_id);
      await Medicine.update(item.medicine_id, {
        stock_quantity: medicine.stock_quantity + item.quantity,
      });
    }

    // Delete sale items and sale
    await SaleItem.deleteBySaleId(id);
    await Sale.delete(id);

    await client.query("COMMIT");

    res.status(200).json({
      status: 200,
      error: false,
      message: "Sale deleted successfully",
      data: null,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({
      status: 500,
      error: true,
      message: "Error deleting sale",
      data: null,
    });
  } finally {
    client.release();
  }
};
