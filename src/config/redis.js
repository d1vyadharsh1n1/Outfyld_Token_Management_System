import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

export const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

const connectionState = {
  isConnected: false
};

redisClient.on("connect", () => {
  console.log("Redis connected");
  connectionState.isConnected = true;
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err.message);
  console.log(
    "Server will continue without Redis. Please start Redis for queue functionality."
  );
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


export const removeFromQueue = async (counterId, token_id) => {
  if (!connectionState.isConnected) {
    throw new Error("Redis is not connected. Cannot remove from queue.");
  }
  
  const queueKey = getCounterQueueKey(counterId);
  
  // Get all items from queue
  const allItems = await redisClient.lRange(queueKey, 0, -1);
  
  // Find and remove the token
  for (let i = 0; i < allItems.length; i++) {
    const item = JSON.parse(allItems[i]);
    if (item.token_id === token_id) {
      await redisClient.del(queueKey);
      
      for (let j = 0; j < allItems.length; j++) {
        if (j !== i) {
          await redisClient.rPush(queueKey, allItems[j]);
        }
      }
      return true;
    }
  }
  
  return false; 
};


export const peekQueue = async (counterId) => {
  if (!connectionState.isConnected) {
    return null;
  }
  const queueKey = getCounterQueueKey(counterId);
  const data = await redisClient.lIndex(queueKey, 0);
  return data ? JSON.parse(data) : null;
};
