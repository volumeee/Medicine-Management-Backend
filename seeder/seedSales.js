// seedSales.js

const pool = require("../config/database");
const Sale = require("../models/sale");
const SaleItem = require("../models/saleItem");
const Medicine = require("../models/medicines");
const User = require("../models/user");
const salesData = require("../data/salesData");

async function seedSales() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const users = await User.findAllNoLimit();
    const medicines = await Medicine.findAllNoLimit();

    for (const sale of salesData) {
      const user = users[Math.floor(Math.random() * users.length)];
      let totalAmount = 0;
      const saleItems = [];

      for (const item of sale.items) {
        const medicine = medicines.find((m) => m.id === item.medicine_id);
        if (!medicine) {
          console.error(`Medicine with id ${item.medicine_id} not found`);
          continue;
        }

        const itemTotalPrice = parseFloat(
          (medicine.recommended_price * item.quantity).toFixed(2)
        );
        totalAmount += itemTotalPrice;

        saleItems.push({
          medicine_id: item.medicine_id,
          quantity: item.quantity,
          unit_price: medicine.recommended_price,
          total_price: itemTotalPrice,
          medicine_name: medicine.name,
        });

        if (sale.status === "completed") {
          await Medicine.update(item.medicine_id, {
            stock_quantity: medicine.stock_quantity - item.quantity,
          });
        }
      }

      const createdSale = await Sale.create({
        sale_date: sale.sale_date,
        customer_name: sale.customer_name,
        status: sale.status,
        total_amount: parseFloat(totalAmount.toFixed(2)),
        user_id: user.id,
        cashier: user.username,
      });

      for (const item of saleItems) {
        await SaleItem.create({
          sale_id: createdSale.id,
          ...item,
        });
      }
    }

    await client.query("COMMIT");
    console.log("Sales seeded successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error seeding sales:", error);
  } finally {
    client.release();
  }
}

module.exports = seedSales;
