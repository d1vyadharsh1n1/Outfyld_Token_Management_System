import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

export const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

const connectionState = {
  isConnected: false
};

redisClient.on("ready", () => {
  console.log("Redis connected");
  connectionState.isConnected = true;
});

redisClient.on("connect", () => {
  console.log("Redis connection initiated");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err.message);
  console.log(
    "Server will continue without Redis. Please start Redis for queue functionality."
  );
  connectionState.isConnected = false;
});

redisClient.on("end", () => {
  connectionState.isConnected = false;
});

// Connect to Redis (non-blocking)
redisClient.connect().catch((err) => {
  console.error("Redis connection failed:", err.message);
  console.log(
    "Server will continue without Redis. Queue features will not work."
  );
});

// Export getter function to always get current state
export const getIsConnected = () => connectionState.isConnected;
export const isConnected = () => connectionState.isConnected;

/**
 * Event-driven readiness probe for server startup
 */
export const waitForRedisReady = (timeoutMs = 5000) => {
  return new Promise((resolve, reject) => {
    if (redisClient.isReady) {
      connectionState.isConnected = true;
      return resolve(true);
    }

    const timer = setTimeout(() => {
      reject(new Error("Redis connection timed out"));
    }, timeoutMs);

    redisClient.once("ready", () => {
      clearTimeout(timer);
      connectionState.isConnected = true;
      resolve(true);
    });
  });
};

const getCounterQueueKey = (counterId) => `counter:${counterId}`;

//QUEUE management
export const addToQueue = async (counterId, token) => {
  if (!connectionState.isConnected) {
    throw new Error("Redis is not connected. Cannot add to queue.");
  }
  const queueKey = getCounterQueueKey(counterId);
  await redisClient.rPush(queueKey, JSON.stringify(token));
};

export const getNextFromQueue = async (counterId) => {
  if (!connectionState.isConnected) {
    throw new Error("Redis is not connected. Cannot get from queue.");
  }
  const queueKey = getCounterQueueKey(counterId);
  const data = await redisClient.lPop(queueKey);
  return data ? JSON.parse(data) : null;
};

/**
 * ATOMIC REMOVAL FIX:
 * Uses native LREM. Matches and deletes target tokens in a single
 * atomic operation without dropping or locking the key in JS runtime.
 */
export const removeFromQueue = async (counterId, token_id) => {
  if (!connectionState.isConnected) {
    throw new Error("Redis is not connected. Cannot remove from queue.");
  }

  const queueKey = getCounterQueueKey(counterId);
  const allItems = await redisClient.lRange(queueKey, 0, -1);

  // Find exact string representation to remove
  const targetItem = allItems.find((raw) => {
    try {
      const parsed = JSON.parse(raw);
      return parsed.token_id === token_id;
    } catch {
      return false;
    }
  });

  if (targetItem) {
    // LREM key count element: count = 1 removes the first matching entry
    const removedCount = await redisClient.lRem(queueKey, 1, targetItem);
    return removedCount > 0;
  }

  return false;
};

export const getQueueLength = async (counterId) => {
  if (!connectionState.isConnected) {
    return 0;
  }
  const queueKey = getCounterQueueKey(counterId);
  return await redisClient.lLen(queueKey);
};

export const getAllFromQueue = async (counterId) => {
  if (!connectionState.isConnected) {
    return [];
  }
  const queueKey = getCounterQueueKey(counterId);
  const data = await redisClient.lRange(queueKey, 0, -1);
  return data.map((item) => JSON.parse(item));
};


export const peekQueue = async (counterId) => {
  if (!connectionState.isConnected) {
    return null;
  }
  const queueKey = getCounterQueueKey(counterId);
  const data = await redisClient.lIndex(queueKey, 0);
  return data ? JSON.parse(data) : null;
};
