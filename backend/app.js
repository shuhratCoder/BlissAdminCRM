const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const sequelize = require("./config/db");
const adminRoutes = require("./routes/admin.routes");
const ownerRoutes = require("./routes/owner.routes");
const authRoutes = require("./routes/auth.routes");
// Associationlar yuklanishi shart
require("./models/association");

const app = express();

const PORT = process.env.PORT || 4000;
app.use(express.json());
app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Auth Server",
  });
});

async function start() {
  try {
    await sequelize.authenticate();

    await sequelize.sync({
      alter: false,
    });

    console.log(
      "Auth PostgreSQL connected successfully"
    );
    app.use("/admin", adminRoutes);
    app.use("/admin", ownerRoutes);
    app.use("/auth", authRoutes);
    app.listen(PORT, () => {
      console.log(
        `Auth server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Auth server start error:",
      error
    );
  }
}

start();