// seedMedicines.js

const pool = require("../config/database");
const medicines = require("../data/medicineData");

async function seedMedicines() {
  const client = await pool.connect();
  try {
    for (const medicine of medicines) {
      await client.query(
        `
        INSERT INTO medicines (name, description, category, expiry_date)
        VALUES ($1, $2, $3, $4)
      `,
        [
          medicine.name,
          medicine.description,
          medicine.category,
          medicine.expiry_date,
        ]
      );
    }

    console.log("Medicines seeded successfully");
  } catch (error) {
    console.error("Error seeding medicines:", error);
  } finally {
    client.release();
  }
}

module.exports = seedMedicines;
