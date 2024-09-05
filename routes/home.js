const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const { ROLES } = require("../utils/constants");

router.get(
  "/",
  auth,
  roleAuth([ROLES.ADMIN, ROLES.PHARMACIST]),
  homeController.getHomeDashboard
);

module.exports = router;
