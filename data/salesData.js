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
  medicineIdRange: { min: 1, max: 49 },
  quantityRange: { min: 1, max: 200 },
  daysToSubtract: { min: 1, max: 365 },
  salesCount: 50,
};

// Random data generators
class RandomGenerator {
  constructor(min, max) {
    this.min = min;
    this.max = max;
    this.range = this.generateRange();
  }

  generateRange() {
    return generateShuffledRange(this.min, this.max);
  }

  getNext() {
    if (this.range.length === 0) {
      this.range = this.generateRange();
    }
    return this.range.pop();
  }
}

const medicineIdGenerator = new RandomGenerator(
  config.medicineIdRange.min,
  config.medicineIdRange.max
);
const quantityGenerator = new RandomGenerator(
  config.quantityRange.min,
  config.quantityRange.max
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

const firstNames = [
  "John",
  "Jane",
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Edward",
  "Fiona",
  "George",
  "Hannah",
  "Ian",
  "Julia",
  "Kevin",
  "Laura",
  "Michael",
  "Nancy",
  "Oscar",
  "Patricia",
  "Quentin",
  "Rachel",
  "Samuel",
  "Tina",
  "Ulysses",
  "Victoria",
  "William",
  "Xena",
  "Yvonne",
  "Zachary",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
];

const getRandomName = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
};

// Generate sales data
const generateSalesData = (count) => {
  return Array.from({ length: count }, () => {
    const medicineId1 = medicineIdGenerator.getNext();
    let medicineId2 = medicineIdGenerator.getNext();

    // Ensure medicineId2 is different from medicineId1
    while (medicineId2 === medicineId1) {
      medicineId2 = medicineIdGenerator.getNext();
    }

    return {
      sale_date: getRandomDate(),
      customer_name: getRandomName(),
      status: Math.random() > 0.5 ? "completed" : "pending",
      items: [
        {
          medicine_id: medicineId1,
          quantity: quantityGenerator.getNext(),
        },
        {
          medicine_id: medicineId2,
          quantity: quantityGenerator.getNext(),
        },
      ],
    };
  });
};

const salesData = generateSalesData(config.salesCount);

module.exports = salesData;
