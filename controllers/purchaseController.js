const PurchaseItem = require("../models/purchaseItem");
const Purchase = require("../models/purchase");
const Medicine = require("../models/medicines");
const Supplier = require("../models/supplier");
const pool = require("../config/database");

exports.getAllPurchases = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const totalCount = await Purchase.count();
    const purchases = await Purchase.findAll(limit, offset);
    const purchasesWithDetails = [];

    for (const purchase of purchases) {
      purchasesWithDetails.push({
        id: purchase.id,
        supplier_id: purchase.supplier_id,
        supplier_name: purchase.supplier_name,
        purchase_date: purchase.purchase_date,
        status: purchase.status,
        total_amount: purchase.total_amount,
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
        data: purchasesWithDetails,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: true,
      message: "Error fetching purchases",
      data: null,
    });
  }
};

exports.createPurchase = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { supplier_id, purchase_date, status, items } = req.body;

    const supplier = await Supplier.findById(supplier_id);
    if (!supplier) {
      throw new Error(`Supplier with id ${supplier_id} not found`);
    }

    const purchase = await Purchase.create({
      supplier_id,
      supplier_name: supplier.name,
      purchase_date,
      status,
    });

    let totalAmount = 0;
    const purchaseDetails = [];

    for (const item of items) {
      const { medicine_id, quantity, unit_price } = item;

      const medicine = await Medicine.findById(medicine_id);
      if (!medicine) {
        throw new Error(`Medicine with id ${medicine_id} not found`);
      }

      const itemUnitPrice = parseFloat(unit_price);
      const itemTotalPrice = parseFloat((itemUnitPrice * quantity).toFixed(2));

      await PurchaseItem.create({
        purchase_id: purchase.id,
        medicine_id,
        medicine_name: medicine.name,
        quantity,
        unit_price: itemUnitPrice.toFixed(2),
        total_price: itemTotalPrice.toFixed(2),
      });

      totalAmount += itemTotalPrice;

      await Medicine.update(medicine_id, {
        stock_quantity: medicine.stock_quantity + quantity,
        price: itemUnitPrice.toFixed(2),
        recommended_price: (itemUnitPrice * 1.3).toFixed(2),
        manufacturer: supplier.name,
      });

      const recommendedSellingPrice = (itemUnitPrice * 1.3).toFixed(2);

      purchaseDetails.push({
        medicine_id: medicine_id,
        name: medicine.name,
        quantity,
        unit_price: itemUnitPrice.toFixed(2),
        total_price: itemTotalPrice.toFixed(2),
        recommended_selling_price: recommendedSellingPrice,
      });
    }

    await Purchase.update(purchase.id, {
      total_amount: totalAmount.toFixed(2),
    });

    await client.query("COMMIT");

    res.status(201).json({
      status: 201,
      error: false,
      message: "Purchase created successfully",
      purchase: {
        id: purchase.id,
        supplier_id: supplier_id,
        supplier_name: supplier.name,
        purchase_date: purchase_date,
        status: status,
        total_amount: totalAmount.toFixed(2),
        items: purchaseDetails,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({
      status: 500,
      error: true,
      message: `Error creating purchase: ${error.message}`,
      data: null,
    });
  } finally {
    client.release();
  }
};

exports.updatePurchase = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const { supplier_id, purchase_date, status, items } = req.body;
    const supplier = await Supplier.findById(supplier_id);
    if (!supplier) {
      throw new Error(`Supplier with id ${supplier_id} not found`);
    }

    const purchase = await Purchase.update(id, {
      supplier_id,
      purchase_date,
      status,
    });

    await PurchaseItem.deletePurchaseItems(id);

    let totalAmount = 0;
    const purchaseDetails = [];

    for (const item of items) {
      const { medicine_id, quantity, unit_price } = item;

      const medicine = await Medicine.findById(medicine_id);
      if (!medicine) {
        throw new Error(`Medicine with id ${medicine_id} not found`);
      }

      const itemUnitPrice = parseFloat(unit_price);
      const itemTotalPrice = parseFloat((itemUnitPrice * quantity).toFixed(2));
      const newStockQuantity = medicine.stock_quantity + quantity;
      const recommendedSellingPrice = (itemUnitPrice * 1.3).toFixed(2);

      await Medicine.update(medicine_id, {
        price: itemUnitPrice.toFixed(2),
        recommended_price: recommendedSellingPrice,
        stock_quantity: newStockQuantity,
      });

      await PurchaseItem.create({
        purchase_id: id,
        medicine_id,
        medicine_name: medicine.name,
        quantity,
        unit_price: itemUnitPrice.toFixed(2),
        total_price: itemTotalPrice.toFixed(2),
      });

      totalAmount += itemTotalPrice;

      purchaseDetails.push({
        medicine_id: medicine_id,
        name: medicine.name,
        quantity,
        unit_price: itemUnitPrice.toFixed(2),
        total_price: itemTotalPrice.toFixed(2),
        recommended_selling_price: recommendedSellingPrice,
      });
    }

    await Purchase.update(id, {
      total_amount: totalAmount.toFixed(2),
    });

    await client.query("COMMIT");

    res.status(200).json({
      status: 200,
      error: false,
      message: "Purchase updated successfully",
      data: {
        purchase: {
          id: purchase.id,
          supplier_id: supplier_id,
          supplier_name: supplier.name,
          purchase_date: purchase_date,
          status: status,
          total_amount: totalAmount.toFixed(2),
          items: purchaseDetails,
        },
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({
      status: 500,
      error: true,
      message: `Error updating purchase: ${error.message}`,
      data: null,
    });
  } finally {
    client.release();
  }
};

exports.findPurchaseDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const purchase = await Purchase.findById(id);

    if (!purchase) {
      return res.status(404).json({
        status: 404,
        error: true,
        message: "Purchase not found",
        data: null,
      });
    }

    const purchaseItems = await PurchaseItem.findByPurchaseId(id);
    const purchaseDetails = [];

    for (const item of purchaseItems) {
      const medicine = await Medicine.findById(item.medicine_id);
      const recommendedSellingPrice = item.unit_price * 1.3;

      purchaseDetails.push({
        medicine_id: item.medicine_id,
        name: medicine.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        recommended_selling_price: recommendedSellingPrice,
      });
    }

    res.status(200).json({
      status: 200,
      error: false,
      message: "Purchase details retrieved successfully",

      purchase: {
        id: purchase.id,
        supplier_id: purchase.supplier_id,
        purchase_date: purchase.purchase_date,
        status: purchase.status,
        total_amount: purchase.total_amount,
        items: purchaseDetails,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: true,
      message: "Error fetching purchase detail",
      data: null,
    });
  }
};

exports.deletePurchase = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const purchase = await Purchase.findById(id);

    if (!purchase) {
      return res.status(404).json({
        status: 404,
        error: true,
        message: "Purchase not found",
        data: null,
      });
    }

    const purchaseItems = await PurchaseItem.findByPurchaseId(id);

    for (const item of purchaseItems) {
      const medicine = await Medicine.findById(item.medicine_id);
      await Medicine.update(item.medicine_id, {
        stock_quantity: medicine.stock_quantity - item.quantity,
      });
    }

    await PurchaseItem.deletePurchaseItems(id);
    await Purchase.delete(id);

    await client.query("COMMIT");

    res.status(200).json({
      status: 200,
      error: false,
      message: "Purchase deleted successfully",
      data: null,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({
      status: 500,
      error: true,
      message: "Error deleting purchase",
      data: null,
    });
  } finally {
    client.release();
  }
};
