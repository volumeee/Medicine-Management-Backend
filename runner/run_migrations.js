const createRolesTable = require("../migrations/20240825_create_roles");
const createUsersTable = require("../migrations/20240825_create_users");
// const createAuthTokensTable = require("../migrations/20240825_create_auth_tokens");
const createPasswordResetTokensTable = require("../migrations/20240825_create_password_reset_tokens");
const createMedicinesTable = require("../migrations/20240825_create_medicines");
const createSuppliersTable = require("../migrations/20240825_create_suppliers");
const createPurchasesTable = require("../migrations/20240825_create_purchases");
const createPurchaseItemsTable = require("../migrations/20240825_create_purchase_items");
const createSalesTable = require("../migrations/20240825_create_sales");
const createSaleItemsTable = require("../migrations/20240825_create_sale_items");

async function runMigrations() {
  await createRolesTable();
  await createUsersTable();
  //   await createAuthTokensTable();
  await createPasswordResetTokensTable();
  await createMedicinesTable();
  await createSuppliersTable();
  await createPurchasesTable();
  await createPurchaseItemsTable();
  await createSalesTable();
  await createSaleItemsTable();
  process.exit();
}

runMigrations();
