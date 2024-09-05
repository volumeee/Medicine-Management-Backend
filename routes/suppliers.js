const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const { ROLES } = require("../utils/constants");

router.post(
  "/",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.INVENTORY_MANAGER]),
  supplierController.createSupplier
);
router.get(
  "/",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.INVENTORY_MANAGER]),
  supplierController.getAllSuppliers
);
router.get(
  "/:id",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.INVENTORY_MANAGER]),
  supplierController.getSupplierById
);
router.put(
  "/:id",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.INVENTORY_MANAGER]),
  supplierController.updateSupplier
);
router.delete(
  "/:id",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.INVENTORY_MANAGER]),
  supplierController.deleteSupplier
);

module.exports = router;
