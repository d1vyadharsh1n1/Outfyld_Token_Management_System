// server.js
require("dotenv").config();
const express = require("express");
const { Sequelize } = require("sequelize");

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Sequelize using the DATABASE_URL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: console.log, // Set to true to see SQL, false for production
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

// Function to check connection and start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ DB Connection Successful. Supabase Ready.");

    app.get("/", (req, res) => res.send("Queue System Backend Running."));

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ DB Connection Failed:", error.message);
    process.exit(1);
  }
}

startServer();
