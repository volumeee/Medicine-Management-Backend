// routes/sales.js
const express = require("express");
const router = express.Router();
const saleController = require("../controllers/saleController");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const { ROLES } = require("../utils/constants");

router.post(
  "/",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  saleController.createSale
);
router.get(
  "/",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  saleController.getAllSales
);
router.get(
  "/:id",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  saleController.findSaleById
);
router.put(
  "/:id",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  saleController.updateSale
);
router.delete(
  "/:id",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  saleController.deleteSale
);

module.exports = router;
