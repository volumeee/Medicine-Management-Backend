const pool = require("../config/database");
const Medicine = require("../models/medicines");
const Supplier = require("../models/supplier");
const purchaseData = require("../data/purchaseData");

async function seedPurchases() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const suppliers = await Supplier.FindAllNoLimit();
    const medicines = await Medicine.findAllNoLimit();

    for (const purchase of purchaseData) {
      const supplier = suppliers.find((s) => s.id === purchase.supplier_id);
      if (!supplier) {
        continue;
      }

      const { rows } = await client.query(
        `
        INSERT INTO purchases (supplier_id, supplier_name, purchase_date, total_amount, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
        `,
        [
          purchase.supplier_id,
          supplier.name,
          purchase.purchase_date,
          0,
          purchase.status,
        ]
      );

      const purchaseId = rows[0].id;
      let totalAmount = 0;

      for (const item of purchase.items) {
        const medicine = medicines.find((m) => m.id === item.medicine_id);
        if (!medicine) {
          continue;
        }

        const totalPrice = item.quantity * item.unit_price;
        totalAmount += totalPrice;

        await client.query(
          `
          INSERT INTO purchase_items (purchase_id, medicine_id, medicine_name, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            purchaseId,
            item.medicine_id,
            medicine.name,
            item.quantity,
            item.unit_price,
            totalPrice,
          ]
        );

        try {
          const updatedMedicine = await Medicine.update(item.medicine_id, {
            stock_quantity: medicine.stock_quantity + item.quantity,
            recommended_price: item.unit_price * 1.3,
            price: item.unit_price,
            manufacturer: supplier.name,
          });

          console.log(`Updated medicine: ${updatedMedicine.name}`);
        } catch (updateError) {
          console.error(
            `Error updating medicine ${item.medicine_id}:`,
            updateError
          );
        }
      }

      await client.query(
        `
        UPDATE purchases
        SET total_amount = $1
        WHERE id = $2
        `,
        [totalAmount, purchaseId]
      );
    }

    await client.query("COMMIT");
    console.log("Purchases seeded successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error seeding purchases:", error);
  } finally {
    client.release();
  }
}

module.exports = seedPurchases;
