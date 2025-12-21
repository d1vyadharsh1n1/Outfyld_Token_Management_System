import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

export const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

// Use an object to ensure reference is maintained across imports
const connectionState = {
  isConnected: false
};

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
  connectionState.isConnected = true;
});

redisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err.message);
  console.log(
    "⚠️  Server will continue without Redis. Please start Redis for queue functionality."
  );
  connectionState.isConnected = false;
});

// Connect to Redis (non-blocking)
redisClient.connect().catch((err) => {
  console.error("⚠️  Redis connection failed:", err.message);
  console.log(
    "⚠️  Server will continue without Redis. Queue features will not work."
  );
});

// Export getter function to always get current state
export const getIsConnected = () => connectionState.isConnected;
export const isConnected = () => connectionState.isConnected; // Alias for convenience

// Queue management functions with error handling
export const addToQueue = async (serviceName, token) => {
  if (!connectionState.isConnected) {
    throw new Error("Redis is not connected. Cannot add to queue.");
  }
  await redisClient.rPush(serviceName, JSON.stringify(token));
};

export const getNextFromQueue = async (serviceName) => {
  if (!connectionState.isConnected) {
    throw new Error("Redis is not connected. Cannot get from queue.");
  }
  const data = await redisClient.lPop(serviceName);
  return data ? JSON.parse(data) : null;
};

export const getQueueLength = async (serviceName) => {
  if (!connectionState.isConnected) {
    return 0;
  }
  return await redisClient.lLen(serviceName);
};

export const getAllFromQueue = async (serviceName) => {
  if (!connectionState.isConnected) {
    return [];
  }
  const data = await redisClient.lRange(serviceName, 0, -1);
  return data.map((item) => JSON.parse(item));
};
