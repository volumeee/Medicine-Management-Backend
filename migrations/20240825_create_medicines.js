const pool = require("../config/database");

async function createMedicinesTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS medicines (
        id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        price DECIMAL(10, 2),
        recommended_price DECIMAL(10, 2),
        stock_quantity INTEGER,
        manufacturer VARCHAR(255),
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Medicines table created successfully");
  } catch (error) {
    console.error("Error creating medicines table:", error);
  } finally {
    client.release();
  }
}

module.exports = createMedicinesTable;
