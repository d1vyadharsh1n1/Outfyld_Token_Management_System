import {
  createToken,
  serveNextToken,
  markTokenServed,
  skipToken,
  getCountersWithQueues,
} from "../services/tokenService.js";
import { broadcastToKiosk, broadcastToAdmin } from "../sockets/queueSocket.js";
import { Service } from "../models/index.js";

// ==================== REAL DATABASE CRUD ====================

export const createService = async (req, res) => {
  try {
    const { service_id, name, avg_duration_minutes, is_active } = req.body;

    if (!service_id || !name) {
      return res.status(400).json({
        success: false,
        error: "service_id and name are required fields",
      });
    }

    const service = await Service.create({
      service_id: service_id.toUpperCase(),
      name,
      avg_duration_minutes: avg_duration_minutes || 5,
      is_active: is_active !== undefined ? is_active : true,
    });

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { is_active: true },
      order: [["name", "ASC"]],
      attributes: ["service_id", "name", "avg_duration_minutes", "is_active"],
    });

    res.status(200).json({ success: true, data: services });
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({ success: false, error: `Service '${id}' not found` });
    }

    await service.update(req.body);
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({ success: false, error: `Service '${id}' not found` });
    }

    // Soft delete: toggle active state to preserve historical ledger FK integrity
    await service.update({ is_active: false });
    res.status(200).json({
      success: true,
      message: `Service '${id}' deactivated successfully (preserved for audit logs)`,
    });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==================== QUEUE OPERATIONS ====================

export const generateToken = async (req, res) => {
  try {
    const token = await createToken(req);

    broadcastToAdmin("token:generated", {
      token,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({ success: true, data: token });
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const callNextToken = async (req, res) => {
  try {
    const counterId = parseInt(req.params.counter_id, 10);
    if (!counterId) {
      return res.status(400).json({ success: false, error: "Valid counter_id is required" });
    }

    const next = await serveNextToken(counterId);

    if (next) {
      broadcastToKiosk("token:called", {
        counterId: next.counter_id,
        counterName: next.counter_name,
        token: {
          token_id: next.token_id,
          tokenNumber: next.tokenNumber,
          service_id: next.service_id,
          service_name: next.service_name,
        },
        timestamp: new Date().toISOString(),
      });

      broadcastToAdmin("queue:update", {
        counterId: next.counter_id,
        currentToken: next.tokenNumber,
        action: "called",
      });

      res.json({ success: true, data: next });
    } else {
      res.status(404).json({ success: false, message: `No tokens waiting for counter ${counterId}` });
    }
  } catch (error) {
    console.error("Call next token error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const serveToken = async (req, res) => {
  try {
    const { token_id } = req.body;
    if (!token_id) return res.status(400).json({ success: false, error: "token_id is required" });

    const token = await markTokenServed(token_id);
    broadcastToAdmin("queue:update", { token_id: token.token_id, action: "served" });

    res.json({ success: true, data: token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const skipTokenCall = async (req, res) => {
  try {
    const { token_id } = req.body;
    if (!token_id) return res.status(400).json({ success: false, error: "token_id is required" });

    const token = await skipToken(token_id);
    broadcastToAdmin("queue:update", { token_id: token.token_id, action: "skipped" });

    res.json({ success: true, data: token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCounters = async (req, res) => {
  try {
    const counters = await getCountersWithQueues();
    res.json({ success: true, data: counters });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
