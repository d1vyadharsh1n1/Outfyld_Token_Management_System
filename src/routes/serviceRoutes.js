import express from "express";
import {
 createService,
  getServices,
  updateService,
  deleteService,
  generateToken,
  callNextToken,
  serveToken,
  skipTokenCall,
  getCounters
} from "../controllers/serviceController.js";

const router = express.Router();

// Service management routes
router.post("/", createService);
router.get("/", getServices);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

// Counter routes
router.get("/counters", getCounters);

// Token routes
router.post("/token", generateToken);
router.get("/token/next/:counter_id", callNextToken);
router.post("/token/serve", serveToken);
router.post("/token/skip", skipTokenCall);

export default router;