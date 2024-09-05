// const seedMedicines = require("../seeder/seedMedicine");
// const seedSuppliers = require("../seeder/seedSupplier");
// const seedPurchases = require("../seeder/seedPurchase");
const seedSales = require("../seeder/seedSales");

async function runSeeder() {
  // await seedMedicines();
  // await seedSuppliers();
  // await seedPurchases();
  await seedSales();
  process.exit();
}

runSeeder();
