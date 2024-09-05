const Medicine = require("../models/medicines");

exports.getAllMedicines = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const totalCount = await Medicine.count();
    const medicines = await Medicine.findAll(limit, offset);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
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
        data: medicines,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: true,
      message: error.message,
      data: null,
    });
  }
};

exports.createMedicine = async (req, res) => {
  try {
    const newMedicineData = req.body;

    Object.keys(newMedicineData).forEach(
      (key) =>
        (newMedicineData[key] === undefined || newMedicineData[key] === null) &&
        delete newMedicineData[key]
    );

    if (Object.keys(newMedicineData).length === 0) {
      return res.status(400).json({
        status: 400,
        error: true,
        message: "No valid data provided",
        data: null,
      });
    }

    const createdMedicine = await Medicine.create(newMedicineData);

    res.status(201).json({
      status: 201,
      error: false,
      message: "Medicine created successfully",
      medicine: createdMedicine,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: true,
      message: error.message,
      data: null,
    });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove undefined or null values from updateData
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: 400,
        error: true,
        message: "No valid update data provided",
        data: null,
      });
    }

    const existingMedicine = await Medicine.findById(id);

    if (!existingMedicine) {
      return res.status(404).json({
        status: 404,
        error: true,
        message: "Medicine not found",
        data: null,
      });
    }

    const updatedMedicine = await Medicine.update(id, updateData);

    res.json({
      status: 200,
      error: false,
      message: "Medicine updated successfully",
      data: {
        medicine: updatedMedicine,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: true,
      message: error.message,
      data: null,
    });
  }
};

exports.getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;
    const medicine = await Medicine.findById(id);
    if (medicine) {
      res.json({
        status: 200,
        error: false,
        message: "Medicine found",
        data: {
          medicine: medicine,
        },
      });
    } else {
      res.status(404).json({
        status: 404,
        error: true,
        message: "Medicine not found",
        data: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: true,
      message: error.message,
      data: null,
    });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const medicine = await Medicine.findById(id);
    if (medicine) {
      await Medicine.delete(id);
      res.json({
        status: 200,
        error: false,
        message: "Medicine deleted successfully",
        data: null,
      });
    } else {
      res.status(404).json({
        status: 404,
        error: true,
        message: "Medicine not found",
        data: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: true,
      message: error.message,
      data: null,
    });
  }
};
