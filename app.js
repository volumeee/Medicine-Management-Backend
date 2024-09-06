const express = require("express");
const cors = require("cors");
require("dotenv").config();

//require routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const medicinesRoutes = require("./routes/medicines");
const suppliersRoutes = require("./routes/suppliers");
const purchaseRoutes = require("./routes/purchases");
const salesRoutes = require("./routes/sales");
const reportRoutes = require("./routes/report");
const homeRoutes = require("./routes/home");

const app = express();

app.use(cors());
app.use(express.json());

// middleware to set the Permissions-Policy header
app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "private-state-token-redemption=(), private-state-token-issuance=(), browsing-topics=()"
  );
  next();
});

//routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/medicines", medicinesRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/report", reportRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
