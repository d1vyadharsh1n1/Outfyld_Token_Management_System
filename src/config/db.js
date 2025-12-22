import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";

// Initialize Sequelize using the DATABASE_URL
export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

// Test database connection
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection successful. Supabase Ready.");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};
