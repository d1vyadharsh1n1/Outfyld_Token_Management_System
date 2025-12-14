import express from "express";
import {
 createService,
  getServices,
  updateService,
  deleteService,
  generateToken,
  callNextToken,
  prevToken
} from "../controllers/serviceController.js";

const router = express.Router();

router.post("/", createService);
router.get("/", getServices);
router.put("/:id", updateService);
router.delete("/:id", deleteService);
router.post("/token", generateToken);
router.get("/token/next/:service", callNextToken);
router.post('/prev',prevToken);
export default router;