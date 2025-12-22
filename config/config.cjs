require("dotenv").config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    logging: console.log,
    dialectOptions: {
      ssl: process.env.DATABASE_URL?.includes("supabase") || process.env.DATABASE_URL?.includes("amazonaws") 
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
    },
  },
  test: {
    url: process.env.DATABASE_URL || process.env.TEST_DATABASE_URL,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: process.env.DATABASE_URL?.includes("supabase") || process.env.DATABASE_URL?.includes("amazonaws")
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
    },
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: process.env.DATABASE_URL?.includes("supabase") || process.env.DATABASE_URL?.includes("amazonaws")
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
    },
  },
};


