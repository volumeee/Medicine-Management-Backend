const Supplier = require("../models/supplier");

exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({
      status: 201,
      error: false,
      message: "Supplier created successfully",
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: true,
      message: "Error creating supplier",
      data: { error: error.message },
    });
  }
};

exports.getAllSuppliers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const suppliers = await Supplier.findAll(limit, offset);
    const totalSuppliers = await Supplier.count();
    const totalPages = Math.ceil(totalSuppliers / limit);

    res.status(200).json({
      status: 200,
      error: false,
      message: "Success",
      data: {
        meta: {
          total: totalSuppliers,
        },
        page: {
          current: page,
          total: totalPages,
          size: limit,
        },
        data: suppliers,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: true,
      message: "Error fetching suppliers",
      data: { error: error.message },
    });
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        status: 404,
        error: true,
        message: "Supplier not found",
        data: null,
      });
    }
    res.status(200).json({
      status: 200,
      error: false,
      message: "Success",
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: true,
      message: "Error fetching supplier",
      data: { error: error.message },
    });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.update(req.params.id, req.body);
    if (!supplier) {
      return res.status(404).json({
        status: 404,
        error: true,
        message: "Supplier not found",
        data: null,
      });
    }
    res.status(200).json({
      status: 200,
      error: false,
      message: "Supplier updated successfully",
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: true,
      message: "Error updating supplier",
      data: { error: error.message },
    });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        status: 404,
        error: true,
        message: "Supplier not found",
        data: null,
      });
    }
    await Supplier.delete(req.params.id);
    res.status(200).json({
      status: 200,
      error: false,
      message: "Supplier deleted successfully",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: true,
      message: "Error deleting supplier",
      data: { error: error.message },
    });
  }
};
