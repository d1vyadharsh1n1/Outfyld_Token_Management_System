import { sequelize } from "../config/db.js";
import { Sequelize } from "sequelize";
import { addToQueue, getNextFromQueue, getIsConnected } from "../config/redis.js";
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
    const { service_id, counter_id } = req.body;
    
    // Validate required fields
    if (!service_id) {
      throw new Error("service_id is required");
    }
    
    // Validate service exists in database
    const service = await Service.findByPk(service_id, { transaction });
    if (!service) {
      throw new Error(`Service with ID '${service_id}' not found`);
    }
    
    if (!service.is_active) {
      throw new Error(`Service '${service_id}' is not active`);
    }
    
    // Get or validate counter
    let counter;
    if (counter_id) {
      counter = await Counter.findByPk(counter_id, { transaction });
      if (!counter) {
        throw new Error(`Counter with ID ${counter_id} not found`);
      }
      
      // Validate counter supports this service
      if (!counter.supported_service_ids.includes(service_id)) {
        throw new Error(`Counter ${counter_id} does not support service ${service_id}`);
      }
    } else {
      // Find first available counter that supports this service
      // PostgreSQL array contains operator - use literal SQL for array check
      counter = await Counter.findOne({
        where: sequelize.literal(`'${service_id}' = ANY(supported_service_ids) AND is_open = true`),
        transaction,
      });
      
      if (!counter) {
        throw new Error(`No open counter available for service '${service_id}'`);
      }
    }
    
    // Generate professional token IDs
    const token_id = generateTokenId();
    const tokenNumber = generateTokenNumber(service_id);
    
    // Create token in Postgres first (within transaction)
    const tokenRecord = await TokenHistory.create(
      {
        token_id,
        service_id,
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
      service_id,
      service_name: service.name,
      counter_id: counter.counter_id,
      counter_name: counter.name,
      timestamp: new Date().toISOString(),
    };
    
    // Add to Redis queue (if Redis is available)
    // Use getter function to get current connection state
    if (getIsConnected()) {
      await addToQueue(service_id, tokenData);
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
      service_id,
      service_name: service.name,
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
 */
export const serveNextToken = async (service_id, counter_id) => {
  const transaction = await sequelize.transaction();
  
  try {
    if (!getIsConnected()) {
      throw new Error("Redis is not connected. Cannot get next token.");
    }
    
    // Get next token from Redis queue
    const queueToken = await getNextFromQueue(service_id);
    
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
        assigned_counter_id: counter_id || tokenRecord.assigned_counter_id,
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
 * Skip token (increment skip count)
 */
export const skipToken = async (token_id) => {
  const transaction = await sequelize.transaction();
  
  try {
    const tokenRecord = await TokenHistory.findByPk(token_id, { transaction });
    
    if (!tokenRecord) {
      throw new Error(`Token ${token_id} not found`);
    }
    
    await tokenRecord.update(
      {
        skip_count: tokenRecord.skip_count + 1,
        status: "skipped",
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
