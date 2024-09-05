const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const { ROLES } = require("../utils/constants");

router.get(
  "/genereate-profit-report",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  reportController.generateProfitReport
);

router.get(
  "/genereate-inventory-report",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  reportController.generateInventoryReport
);
router.get(
  "/genereate-expiration-medicine-report",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  reportController.generateExpirationReport
);

router.get(
  "/genereate-sales-report",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  reportController.generateSalesReport
);

module.exports = router;
