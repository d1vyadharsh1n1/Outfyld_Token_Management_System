import { createToken, serveNextToken, markTokenServed, skipToken } from "../services/tokenService.js";
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
      order: [["name", "ASC"]]
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
    
    // Broadcast new token ONLY to admin dashboard (customers don't need to see every print)
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
    const { service } = req.params;
    const counterId = parseInt(req.query.counter_id) || parseInt(req.body.counter_id) || null;
    
    const next = await serveNextToken(service, counterId);
    
    if (next) {
      // Broadcast to KIOSK (everyone needs to see who is next)
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
      
      // Also notify admin dashboard
      broadcastToAdmin("queue:update", {
        counterId: next.counter_id,
        currentToken: next.tokenNumber,
        token_id: next.token_id,
        action: "called"
      });
      
      res.json({
        success: true,
        data: next
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: "No tokens in queue for this service" 
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