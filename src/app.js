import express from "express";
import serviceRoutes from "./routes/serviceRoutes.js";
import tokenRoutes from "./routes/tokenRoutes.js";

const app = express();

// Middleware
app.use(express.json());

// CORS middleware for frontend
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Routes
app.get("/", (req, res) => {
  res.send("Backend server is running");
});

app.use("/api", serviceRoutes);
app.use("/services", serviceRoutes);
app.use("/token", tokenRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message
  });
});

export default app;