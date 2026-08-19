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

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4000;

/*
|--------------------------------------------------------------------------
| Allowed Origins
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  "https://blissmebel.uz",

  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3009",
  "http://localhost:3009",
];

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(express.json());

app.use(helmet());

app.use(
  cors({
    origin: function (origin, callback) {
      /*
       * Electron yoki server-to-server requestlarda
       * origin bo'lmasligi mumkin.
       */
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked:", origin);

      return callback(
        new Error("CORS policy: Origin not allowed")
      );
    },

    credentials: true,
  })
);

app.use(morgan("dev"));

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Auth Server",
  });
});

/*
|--------------------------------------------------------------------------
| Server
|--------------------------------------------------------------------------
*/

async function start() {
  try {
    await sequelize.authenticate();

    await sequelize.sync({
      alter: false,
    });

    console.log(
      "Auth PostgreSQL connected successfully"
    );

    /*
    |--------------------------------------------------------------------------
    | Routes
    |--------------------------------------------------------------------------
    */

    app.use("/admin", adminRoutes);

    app.use("/admin", ownerRoutes);

    app.use("/auth", authRoutes);

    /*
    |--------------------------------------------------------------------------
    | Start Server
    |--------------------------------------------------------------------------
    */

    app.listen(PORT, () => {
      console.log(
        `Auth server running on port ${PORT}`
      );

      console.log(
        "Allowed origins:",
        allowedOrigins
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