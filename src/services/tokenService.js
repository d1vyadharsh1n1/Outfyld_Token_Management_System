import { sequelize } from "../config/db.js";
import { Sequelize } from "sequelize";
import {
  addToQueue,
  getNextFromQueue,
  getIsConnected,
  removeFromQueue,
  redisClient,
  getAllFromQueue,
} from "../config/redis.js";
import { Service, Counter, TokenHistory } from "../models/index.js";
import { getDailyCounter, formatTokenId, formatTokenNumber } from "../utils/tokenGenerator.js";
import { acquireLock, releaseLock } from "../utils/distributedLock.js";

const { Op } = Sequelize;

/**
 * Generate Token: Single daily counter increment with ACID transaction
 */
export const createToken = async (req) => {
  const transaction = await sequelize.transaction();

  try {
    const { service_id, service, counter_id } = req.body;
    let finalServiceId = service_id;

    // Parameterized lookup for service
    if (!finalServiceId && service) {
      const serviceRecord = await Service.findOne({
        where: { name: { [Op.iLike]: service } },
        transaction,
      });

      if (!serviceRecord || !serviceRecord.is_active) {
        await transaction.rollback();
        throw new Error(`Service '${service}' is invalid or inactive`);
      }
      finalServiceId = serviceRecord.service_id;
    }

    const serviceRecord = await Service.findByPk(finalServiceId, { transaction });
    if (!serviceRecord || !serviceRecord.is_active) {
      await transaction.rollback();
      throw new Error(`Service '${finalServiceId}' is invalid or inactive`);
    }

    // Resolve Counter
    let counter;
    if (counter_id) {
      counter = await Counter.findByPk(counter_id, { transaction });
      if (!counter || !counter.supported_service_ids.includes(finalServiceId)) {
        await transaction.rollback();
        throw new Error(`Counter ${counter_id} does not support service ${finalServiceId}`);
      }
    } else {
      counter = await Counter.findOne({
        where: {
          supported_service_ids: { [Op.contains]: [finalServiceId] },
          is_open: true,
        },
        transaction,
      });

      if (!counter) {
        await transaction.rollback();
        throw new Error(`No open counter available for service '${finalServiceId}'`);
      }
    }

    // SINGLE INCREMENT FIX: Call getDailyCounter() once
    const dailySeq = await getDailyCounter();
    const token_id = formatTokenId(dailySeq);
    const tokenNumber = formatTokenNumber(finalServiceId, dailySeq);

    // Save to PostgreSQL ledger
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

    const tokenData = {
      token_id,
      tokenNumber,
      service_id: finalServiceId,
      service_name: serviceRecord.name,
      counter_id: counter.counter_id,
      counter_name: counter.name,
      timestamp: tokenRecord.generation_timestamp,
    };

    // Push to Redis Queue
    if (getIsConnected()) {
      await addToQueue(counter.counter_id, tokenData);
    } else {
      await transaction.rollback();
      throw new Error("Redis unavailable. Token generation aborted to protect queue state.");
    }

    await transaction.commit();
    return tokenData;
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    throw error;
  }
};

/**
 * GHOST TOKEN & DISTRIBUTED LOCK FIX:
 * Acquires a distributed lock on the counter before popping.
 * If PostgreSQL fails to update after Redis pop, re-pushes token back to Redis head.
 */
export const serveNextToken = async (counter_id) => {
  if (!getIsConnected()) throw new Error("Redis is not connected");
  if (!counter_id) throw new Error("counter_id is required");

  // 1. Acquire Distributed Lock for Counter
  const lockKey = `lock:counter:${counter_id}`;
  const lockId = await acquireLock(lockKey, 4000);

  if (!lockId) {
    throw new Error("Counter is currently processing another request. Try again.");
  }

  let poppedToken = null;
  const transaction = await sequelize.transaction();

  try {
    const counter = await Counter.findByPk(counter_id, { transaction });
    if (!counter || !counter.is_open) {
      await transaction.rollback();
      throw new Error(`Counter ${counter_id} is invalid or closed`);
    }

    // 2. Pop from Redis queue
    poppedToken = await getNextFromQueue(counter_id);
    if (!poppedToken) {
      await transaction.commit();
      return null;
    }

    // 3. Update PostgreSQL status
    const tokenRecord = await TokenHistory.findByPk(poppedToken.token_id, { transaction });
    if (!tokenRecord) {
      throw new Error(`Token ${poppedToken.token_id} in queue but missing from persistent database`);
    }

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
      ...poppedToken,
      status: "called",
      called_timestamp: tokenRecord.called_timestamp,
    };
  } catch (error) {
    await transaction.rollback();

    // GHOST TOKEN COMPENSATION: If popped from Redis but Postgres failed, push back to head
    if (poppedToken) {
      console.warn(`Re-pushing token ${poppedToken.token_id} to Redis head after rollback`);
      try {
        await redisClient.lPush(`counter:${counter_id}`, JSON.stringify(poppedToken));
      } catch (redisErr) {
        console.error("Critical: Failed to restore token to Redis:", redisErr.message);
      }
    }
    throw error;
  } finally {
    // 4. Always release the distributed lock
    await releaseLock(lockKey, lockId);
  }
};

export const markTokenServed = async (token_id) => {
  const transaction = await sequelize.transaction();
  try {
    const tokenRecord = await TokenHistory.findByPk(token_id, { transaction });
    if (!tokenRecord) throw new Error(`Token ${token_id} not found`);

    await tokenRecord.update(
      { status: "served", served_timestamp: new Date() },
      { transaction }
    );

    await transaction.commit();
    return tokenRecord;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const skipToken = async (token_id) => {
  const transaction = await sequelize.transaction();
  try {
    const tokenRecord = await TokenHistory.findByPk(token_id, { transaction });
    if (!tokenRecord) throw new Error(`Token ${token_id} not found`);

    await tokenRecord.update(
      {
        skip_count: tokenRecord.skip_count + 1,
        status: "skipped",
      },
      { transaction }
    );

    if (getIsConnected()) {
      await removeFromQueue(tokenRecord.assigned_counter_id, token_id);
    }

    await transaction.commit();
    return tokenRecord;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getCountersWithQueues = async () => {
  const counters = await Counter.findAll({
    order: [["counter_id", "ASC"]],
    attributes: ["counter_id", "name", "is_open", "operator_name", "supported_service_ids"],
  });

  return await Promise.all(
    counters.map(async (counter) => {
      let queue = [];
      let currentToken = null;

      if (getIsConnected()) {
        queue = await getAllFromQueue(counter.counter_id);

        const calledToken = await TokenHistory.findOne({
          where: { assigned_counter_id: counter.counter_id, status: "called" },
          order: [["called_timestamp", "DESC"]],
          include: [{ model: Service, as: "service", attributes: ["service_id", "name"] }],
        });

        if (calledToken) {
          currentToken = {
            token_id: calledToken.token_id,
            tokenNumber: formatTokenNumber(calledToken.service_id, calledToken.token_id.split("-")[1] || 1),
            service_id: calledToken.service_id,
            service_name: calledToken.service?.name || "Unknown",
          };
        }
      }

      return {
        counter_id: counter.counter_id,
        name: counter.name,
        is_open: counter.is_open,
        operator_name: counter.operator_name,
        supported_service_ids: counter.supported_service_ids,
        queue,
        current: currentToken,
      };
    })
  );
};

export const syncQueueFromPostgres = async () => {
  if (!getIsConnected()) return;

  const pendingTokens = await TokenHistory.findAll({
    where: { status: "pending" },
    include: [
      { model: Service, as: "service", attributes: ["service_id", "name"] },
      { model: Counter, as: "counter", attributes: ["counter_id", "name"] },
    ],
    order: [["generation_timestamp", "ASC"]],
  });

  if (pendingTokens.length === 0) return;

  const grouped = {};
  for (const token of pendingTokens) {
    const cid = token.assigned_counter_id;
    if (!grouped[cid]) grouped[cid] = [];

    const seq = token.token_id.split("-")[1] || "001";
    grouped[cid].push({
      token_id: token.token_id,
      tokenNumber: formatTokenNumber(token.service_id, parseInt(seq, 10)),
      service_id: token.service_id,
      service_name: token.service?.name || "Unknown",
      counter_id: cid,
      counter_name: token.counter?.name || "Unknown",
      timestamp: token.generation_timestamp.toISOString(),
    });
  }

  for (const [cid, tokens] of Object.entries(grouped)) {
    const queueKey = `counter:${cid}`;
    await redisClient.del(queueKey);
    for (const t of tokens) {
      await addToQueue(cid, t);
    }
  }
};
