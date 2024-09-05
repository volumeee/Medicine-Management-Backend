const express = require("express");
const router = express.Router();
const medicineController = require("../controllers/medicineController");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const { ROLES } = require("../utils/constants");

// Protected routes (require authentication and authorization)
router.get(
  "/",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  medicineController.getAllMedicines
);
router.get(
  "/:id",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  medicineController.getMedicineById
);
router.post(
  "/",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  medicineController.createMedicine
);
router.put(
  "/:id",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  medicineController.updateMedicine
);
router.delete(
  "/:id",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  medicineController.deleteMedicine
);

module.exports = router;
