const express = require("express");
const router = express.Router();
const purchaseController = require("../controllers/purchaseController");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const { ROLES } = require("../utils/constants");

router.get(
  "/",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  purchaseController.getAllPurchases
);
router.post(
  "/",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  purchaseController.createPurchase
);
router.put(
  "/:id",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  purchaseController.updatePurchase
);
router.get(
  "/:id",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  purchaseController.findPurchaseDetail
);
router.delete(
  "/:id",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  purchaseController.deletePurchase
);
module.exports = router;
