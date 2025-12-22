import { createToken, serveNextToken, markTokenServed, skipToken, getCountersWithQueues } from "../services/tokenService.js";
import { broadcastToKiosk, broadcastToAdmin } from "../sockets/queueSocket.js";
import { Service, Counter } from "../models/index.js";

export const createService = (req, res) => {
  const { name, status } = req.body;

  const newService = {
    id: Date.now(),
    name,
    status
  };

  res.status(201).json({
    success: true,
    data: newService
  });
};

export const getServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { is_active: true },
      order: [["name", "ASC"]],
      attributes: ["service_id", "name", "avg_duration_minutes", "is_active"]
    });
    
    res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateService = (req, res) => {
  const { id } = req.params;

  res.status(200).json({
    success: true,
    data: {
      id,
      ...req.body
    }
  });
};

export const deleteService = (req, res) => {
  const { id } = req.params;

  res.status(200).json({
    success: true,
    message: `Service ${id} deleted`
  });
};

export const generateToken = async (req, res) => {
  try {
    const token = await createToken(req);
    
    broadcastToAdmin("token:generated", {
      token,
      timestamp: new Date().toISOString()
    });
    
    res.status(201).json({
      success: true,
      data: token
    });
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

export const callNextToken = async (req, res) => {
  try {
    const counterId = parseInt(req.params.counter_id) || parseInt(req.query.counter_id) || parseInt(req.body.counter_id);
    
    if (!counterId) {
      return res.status(400).json({
        success: false,
        error: "counter_id is required"
      });
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
          service_name: next.service_name
        },
        timestamp: new Date().toISOString()
      });
      
      broadcastToAdmin("queue:update", {
        counterId: next.counter_id,
        currentToken: next.tokenNumber,
        token_id: next.token_id,
        service_id: next.service_id,
        service_name: next.service_name,
        action: "called"
      });
      
      res.json({
        success: true,
        data: next
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: `No tokens in queue for counter ${counterId}` 
      });
    }
  } catch (error) {
    console.error("Call next token error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

export const serveToken = async (req, res) => {
  try {
    const { token_id } = req.body;
    
    if (!token_id) {
      return res.status(400).json({
        success: false,
        error: "token_id is required"
      });
    }
    
    const token = await markTokenServed(token_id);
    
    // Broadcast to admin
    broadcastToAdmin("queue:update", {
      token_id: token.token_id,
      action: "served"
    });
    
    res.json({
      success: true,
      data: token
    });
  } catch (error) {
    console.error("Serve token error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const skipTokenCall = async (req, res) => {
  try {
    const { token_id } = req.body;
    
    if (!token_id) {
      return res.status(400).json({
        success: false,
        error: "token_id is required"
      });
    }
    
    const token = await skipToken(token_id);
    
    // Broadcast to admin
    broadcastToAdmin("queue:update", {
      token_id: token.token_id,
      action: "skipped"
    });
    
    res.json({
      success: true,
      data: token
    });
  } catch (error) {
    console.error("Skip token error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getCounters = async (req, res) => {
  try {
    const counters = await getCountersWithQueues();
    
    res.json({
      success: true,
      data: counters
    });
  } catch (error) {
    console.error("Get counters error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};