import "./config/redis.js";
import express from "express";
import serviceRoutes from "./routes/serviceRoutes.js";
import tokenRoutes from "./routes/tokenRoutes.js";




const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend server is running");
});

app.use("/api", serviceRoutes);
app.use("/services",serviceRoutes);
app.use("/token",tokenRoutes);
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message
  });
});
export default app;