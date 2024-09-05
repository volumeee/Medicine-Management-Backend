const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const { ROLES } = require("../utils/constants");

// Protected routes (require authentication)
router.post(
  "/create-user",
  auth,
  roleAuth([ROLES.ADMIN]),
  userController.createNewUser
);
router.put(
  "/update-user/:id",
  auth,
  roleAuth([ROLES.ADMIN]),
  userController.updateUser
);
router.put(
  "/update-username",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST, ROLES.INVENTORY_MANAGER]),
  userController.updateUsername
);
router.put(
  "/update-email",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST, ROLES.INVENTORY_MANAGER]),
  userController.updateEmail
);
router.put(
  "/change-password",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST, ROLES.INVENTORY_MANAGER]),
  userController.changePassword
);
router.put(
  "/update-role",
  auth,
  roleAuth([ROLES.ADMIN]),
  userController.updateUserRole
);
router.get("/", auth, roleAuth([ROLES.ADMIN]), userController.getAllUsers);
router.get(
  "/:id",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST, ROLES.INVENTORY_MANAGER]),
  userController.getUserById
);
router.delete("/:id", auth, roleAuth([ROLES.ADMIN]), userController.deleteUser);

// Public routes
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

module.exports = router;
