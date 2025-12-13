require("dotenv").config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL, // Use the full URL
    dialect: "postgres",
    // Important: Add this to handle connection issues with Supabase SSL
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
