const moment = require("moment-timezone");

// Utility functions
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const generateShuffledRange = (min, max) => {
  return shuffleArray(Array.from({ length: max - min + 1 }, (_, i) => min + i));
};

// Configuration
const config = {
  supplierIdRange: { min: 1, max: 49 },
  medicineIdRange: { min: 1, max: 49 },
  quantityRange: { min: 100, max: 1000 },
  unitPriceRange: { min: 100, max: 2000 },
  daysToSubtract: { min: 1, max: 365 },
  purchaseCount: 42,
};

// Random data generators
class RandomGenerator {
  constructor(min, max) {
    this.min = min;
    this.max = max;
    this.range = generateShuffledRange(min, max);
  }

  getNext() {
    if (this.range.length === 0) {
      this.range = generateShuffledRange(this.min, this.max);
    }
    return this.range.pop();
  }
}

const supplierIdGenerator = new RandomGenerator(
  config.supplierIdRange.min,
  config.supplierIdRange.max
);
const medicineIdGenerator = new RandomGenerator(
  config.medicineIdRange.min,
  config.medicineIdRange.max
);
const quantityGenerator = new RandomGenerator(
  config.quantityRange.min,
  config.quantityRange.max
);
const unitPriceGenerator = new RandomGenerator(
  config.unitPriceRange.min,
  config.unitPriceRange.max
);

const getRandomDate = () => {
  const now = moment();
  const daysToSubtract =
    Math.floor(
      Math.random() *
        (config.daysToSubtract.max - config.daysToSubtract.min + 1)
    ) + config.daysToSubtract.min;
  return now.subtract(daysToSubtract, "days").format("YYYY-MM-DD");
};

// Generate purchase data
const generatePurchaseData = (count) => {
  return Array.from({ length: count }, () => ({
    supplier_id: supplierIdGenerator.getNext(),
    purchase_date: getRandomDate(),
    status: Math.random() > 0.5 ? "completed" : "pending",
    items: [
      {
        medicine_id: medicineIdGenerator.getNext(),
        quantity: quantityGenerator.getNext(),
        unit_price: unitPriceGenerator.getNext(),
      },
      {
        medicine_id: medicineIdGenerator.getNext(),
        quantity: quantityGenerator.getNext(),
        unit_price: unitPriceGenerator.getNext(),
      },
    ],
  }));
};

const purchaseData = generatePurchaseData(config.purchaseCount);

module.exports = purchaseData;
