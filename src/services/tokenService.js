import { sequelize } from "../config/db.js";
import { Sequelize } from "sequelize";
import { addToQueue, getNextFromQueue, getIsConnected, removeFromQueue, redisClient, getAllFromQueue, peekQueue } from "../config/redis.js";
import { Service, Counter, TokenHistory } from "../models/index.js";
import { generateTokenId, generateTokenNumber } from "../utils/tokenGenerator.js";

const { Op } = Sequelize;

/**
 * Generate a new token with transaction logic
 * Ensures data consistency: If Redis fails, Postgres won't save. If Postgres fails, Redis won't save.
 */
export const createToken = async (req) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Support both 'service' (from frontend) and 'service_id' (direct API)
    const { service_id, service, counter_id } = req.body;
    
    // Map service name to service_id if needed
    let finalServiceId = service_id;
    if (!finalServiceId && service) {
      // Find service by name (case-insensitive)
      // Use Sequelize.where with LOWER function for case-insensitive matching
      const serviceRecord = await Service.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('name')),
          sequelize.literal(`LOWER('${service.replace(/'/g, "''")}')`)
        ),
        transaction
      });
      
      if (!serviceRecord) {
        // Check if any services exist in database (without transaction for accurate count)
        const serviceCount = await Service.count();
        if (serviceCount === 0) {
          await transaction.rollback();
          throw new Error(
            `Service '${service}' not found. Database appears to be empty. Please run 'npm run seed' to populate initial data.`
          );
        }
        // Get available services for better error message
        const availableServices = await Service.findAll({ 
          attributes: ['name'],
          where: { is_active: true }
        });
        await transaction.rollback();
        throw new Error(
          `Service '${service}' not found. Available services: ${availableServices.map(s => s.name).join(', ')}`
        );
      }
      
      if (!serviceRecord.is_active) {
        await transaction.rollback();
        throw new Error(`Service '${service}' exists but is inactive`);
      }
      finalServiceId = serviceRecord.service_id;
    }
    
    // Validate required fields
    if (!finalServiceId) {
      throw new Error("service_id or service name is required");
    }
    
    // Validate service exists in database
    const serviceRecord = await Service.findByPk(finalServiceId, { transaction });
    if (!serviceRecord) {
      throw new Error(`Service with ID '${finalServiceId}' not found`);
    }
    
    if (!serviceRecord.is_active) {
      throw new Error(`Service '${finalServiceId}' is not active`);
    }
    
    // Get or validate counter
    let counter;
    if (counter_id) {
      counter = await Counter.findByPk(counter_id, { transaction });
      if (!counter) {
        throw new Error(`Counter with ID ${counter_id} not found`);
      }
      
      // Validate counter supports this service
      if (!counter.supported_service_ids.includes(finalServiceId)) {
        throw new Error(`Counter ${counter_id} does not support service ${finalServiceId}`);
      }
    } else {
      // Find first available counter that supports this service
      // PostgreSQL array contains operator - use literal SQL for array check
      counter = await Counter.findOne({
        where: sequelize.literal(`'${finalServiceId}' = ANY(supported_service_ids) AND is_open = true`),
        transaction,
      });
      
      if (!counter) {
        throw new Error(`No open counter available for service '${finalServiceId}'`);
      }
    }
    
    // Generate professional token IDs (daily counter system)
    const token_id = await generateTokenId();
    const tokenNumber = await generateTokenNumber(finalServiceId);
    
    // Create token in Postgres first (within transaction)
    const tokenRecord = await TokenHistory.create(
      {
        token_id,
        service_id: finalServiceId,
        assigned_counter_id: counter.counter_id,
        status: "pending",
        generation_timestamp: new Date(),
      },
      { transaction }
    );
    
    // Prepare token data for Redis queue
    const tokenData = {
      token_id,
      tokenNumber,
      service_id: finalServiceId,
      service_name: serviceRecord.name,
      counter_id: counter.counter_id,
      counter_name: counter.name,
      timestamp: new Date().toISOString(),
    };
    
    // Add to Redis queue (if Redis is available)
    // Queue is organized by counter_id (each counter has its own queue)
    if (getIsConnected()) {
      await addToQueue(counter.counter_id, tokenData);
    } else {
      // If Redis is down, rollback Postgres transaction
      await transaction.rollback();
      throw new Error(
        "Redis is not available. Token cannot be created without queue functionality."
      );
    }
    
    // Commit transaction (both Postgres and Redis succeeded)
    await transaction.commit();
    
    return {
      token_id,
      tokenNumber,
      service_id: finalServiceId,
      service_name: serviceRecord.name,
      counter_id: counter.counter_id,
      counter_name: counter.name,
      timestamp: tokenRecord.generation_timestamp,
    };
  } catch (error) {
    // Rollback transaction on any error
    await transaction.rollback();
    throw error;
  }
};

/**
 * Get next token from queue and update Postgres
 * Uses transaction to ensure consistency
 * Queue is organized by counter_id (each counter has its own queue)
 */
export const serveNextToken = async (counter_id) => {
  const transaction = await sequelize.transaction();
  
  try {
    if (!getIsConnected()) {
      throw new Error("Redis is not connected. Cannot get next token.");
    }
    
    // Validate counter_id is provided
    if (!counter_id) {
      throw new Error("counter_id is required");
    }
    
    // Validate counter exists
    const counter = await Counter.findByPk(counter_id, { transaction });
    if (!counter) {
      await transaction.rollback();
      throw new Error(`Counter with ID ${counter_id} not found`);
    }
    
    if (!counter.is_open) {
      await transaction.rollback();
      throw new Error(`Counter ${counter_id} is not open`);
    }
    
    // Get next token from Redis queue for this counter
    const queueToken = await getNextFromQueue(counter_id);
    
    if (!queueToken) {
      await transaction.commit(); // No token to process, commit empty transaction
      return null;
    }
    
    // Update token status in Postgres
    const tokenRecord = await TokenHistory.findByPk(queueToken.token_id, {
      transaction,
    });
    
    if (!tokenRecord) {
      // Token in Redis but not in Postgres - data inconsistency
      await transaction.rollback();
      throw new Error(
        `Token ${queueToken.token_id} found in queue but not in database`
      );
    }
    
    // Update token status to "called"
    await tokenRecord.update(
      {
        status: "called",
        called_timestamp: new Date(),
        assigned_counter_id: counter_id,
      },
      { transaction }
    );
    
    await transaction.commit();
    
    return {
      ...queueToken,
      status: "called",
      called_timestamp: tokenRecord.called_timestamp,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Mark token as served
 */
export const markTokenServed = async (token_id) => {
  const transaction = await sequelize.transaction();
  
  try {
    const tokenRecord = await TokenHistory.findByPk(token_id, { transaction });
    
    if (!tokenRecord) {
      throw new Error(`Token ${token_id} not found`);
    }
    
    await tokenRecord.update(
      {
        status: "served",
        served_timestamp: new Date(),
      },
      { transaction }
    );
    
    await transaction.commit();
    return tokenRecord;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Skip token (increment skip count and remove from Redis queue)
 * Ensures Redis and Postgres stay in sync
 */
export const skipToken = async (token_id) => {
  const transaction = await sequelize.transaction();
  
  try {
    const tokenRecord = await TokenHistory.findByPk(token_id, { transaction });
    
    if (!tokenRecord) {
      throw new Error(`Token ${token_id} not found`);
    }
    
    // Update token status in Postgres
    await tokenRecord.update(
      {
        skip_count: tokenRecord.skip_count + 1,
        status: "skipped",
      },
      { transaction }
    );
    
    // Remove token from Redis queue if Redis is connected
    // Note: Redis doesn't support transactions, so we do this after Postgres update
    // If Redis removal fails, we'll rollback Postgres to maintain consistency
    if (getIsConnected()) {
      try {
        await removeFromQueue(tokenRecord.assigned_counter_id, token_id);
      } catch (redisError) {
        // If Redis removal fails, rollback Postgres transaction
        await transaction.rollback();
        throw new Error(
          `Failed to remove token from queue: ${redisError.message}`
        );
      }
    }
    
    await transaction.commit();
    return tokenRecord;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Get all counters with their queue data
 * Returns counters with current token and queue list
 */
export const getCountersWithQueues = async () => {
  try {
    const counters = await Counter.findAll({
      where: {},
      order: [["counter_id", "ASC"]],
      attributes: ["counter_id", "name", "is_open", "operator_name", "supported_service_ids"]
    });
    
    // Get queue data for each counter
    const countersWithQueues = await Promise.all(
      counters.map(async (counter) => {
        let queue = [];
        let currentToken = null;
        
        if (getIsConnected()) {
          // Get all tokens in queue
          queue = await getAllFromQueue(counter.counter_id);
          
          // Get current serving token (if any called tokens exist)
          // Check database for called tokens for this counter
          const calledToken = await TokenHistory.findOne({
            where: {
              assigned_counter_id: counter.counter_id,
              status: "called"
            },
            order: [["called_timestamp", "DESC"]],
            include: [
              {
                model: Service,
                as: "service",
                attributes: ["service_id", "name"]
              }
            ]
          });
          
          if (calledToken) {
            // Extract token number from token_id
            const tokenIdParts = calledToken.token_id.split('-');
            const tokenNumber = tokenIdParts.length === 2
              ? `${calledToken.service_id.substring(0, 3).toUpperCase()}-${tokenIdParts[1]}`
              : calledToken.token_id;
            
            currentToken = {
              token_id: calledToken.token_id,
              tokenNumber: tokenNumber,
              service_id: calledToken.service_id,
              service_name: calledToken.service?.name || "Unknown"
            };
          }
        }
        
        return {
          counter_id: counter.counter_id,
          name: counter.name,
          is_open: counter.is_open,
          operator_name: counter.operator_name,
          supported_service_ids: counter.supported_service_ids,
          queue: queue.map(token => ({
            token_id: token.token_id,
            tokenNumber: token.tokenNumber,
            service_id: token.service_id,
            service_name: token.service_name
          })),
          current: currentToken
        };
      })
    );
    
    return countersWithQueues;
  } catch (error) {
    console.error("Error getting counters with queues:", error);
    throw error;
  }
};

/**
 * Sync Redis queue with Postgres database
 * Rebuilds Redis queue from pending tokens in Postgres
 * Useful for recovery after Redis restart or data inconsistency
 */
export const syncQueueFromPostgres = async () => {
  if (!getIsConnected()) {
    console.log("Redis not connected. Skipping queue sync.");
    return;
  }
  
  try {
    // Get all pending tokens from Postgres
    const pendingTokens = await TokenHistory.findAll({
      where: {
        status: "pending"
      },
      include: [
        {
          model: Service,
          as: "service",
          attributes: ["service_id", "name"]
        },
        {
          model: Counter,
          as: "counter",
          attributes: ["counter_id", "name"]
        }
      ],
      order: [["generation_timestamp", "ASC"]]
    });
    
    if (pendingTokens.length === 0) {
      console.log("Queue sync: No pending tokens found in database");
      return;
    }
    
    // Group tokens by counter_id and rebuild queues (each counter has its own queue)
    const queuesByCounter = {};
    
    for (const token of pendingTokens) {
      const counterId = token.assigned_counter_id;
      
      if (!queuesByCounter[counterId]) {
        queuesByCounter[counterId] = [];
      }
      
      // Reconstruct token data for Redis
      // Extract token number from token_id (format: YYYYMMDD-XXX)
      const tokenNumberParts = token.token_id.split('-');
      const tokenNumber = tokenNumberParts.length === 2 
        ? `${token.service_id.substring(0, 3).toUpperCase()}-${tokenNumberParts[1]}`
        : token.token_id; // Fallback if format is unexpected
      
      const tokenData = {
        token_id: token.token_id,
        tokenNumber: tokenNumber,
        service_id: token.service_id,
        service_name: token.service?.name || "Unknown",
        counter_id: counterId,
        counter_name: token.counter?.name || "Unknown",
        timestamp: token.generation_timestamp.toISOString(),
      };
      
      queuesByCounter[counterId].push(tokenData);
    }
    
    // Clear existing queues and rebuild
    for (const [counterId, tokens] of Object.entries(queuesByCounter)) {
      // Clear existing queue for this counter
      const queueKey = `counter:${counterId}`;
      await redisClient.del(queueKey);
      
      // Rebuild queue in order (oldest first)
      for (const tokenData of tokens) {
        await addToQueue(counterId, tokenData);
      }
      
      console.log(`Synced ${tokens.length} tokens for counter ${counterId}`);
    }
    
    console.log(`Queue sync complete: ${pendingTokens.length} tokens synced across ${Object.keys(queuesByCounter).length} counters`);
  } catch (error) {
    console.error("Queue sync failed:", error.message);
    throw error;
  }
};
