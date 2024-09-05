// seedSuppliers.js

const pool = require("../config/database");
const suppliers = require("../data/supplierData");

async function seedSuppliers() {
  const client = await pool.connect();
  try {
    for (const supplier of suppliers) {
      await client.query(
        `
        INSERT INTO suppliers (name, contact_person, email, phone, address)
        VALUES ($1, $2, $3, $4, $5)
      `,
        [
          supplier.name,
          supplier.contact_person,
          supplier.email,
          supplier.phone,
          supplier.address,
        ]
      );
    }

    console.log("Suppliers seeded successfully");
  } catch (error) {
    console.error("Error seeding suppliers:", error);
  } finally {
    client.release();
  }
}

module.exports = seedSuppliers;
