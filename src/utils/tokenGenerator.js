import { redisClient, getIsConnected } from "../config/redis.js";

/**
 * Fetches and atomically increments the daily counter.
 * Calls Redis INCR once per customer.
 */
export const getDailyCounter = async () => {
  const now = new Date();
  const dateKey = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const counterKey = `daily_counter:${dateKey}`;

  if (!getIsConnected()) {
    // Fallback if Redis is down: generate time-based pseudo-counter
    const time = now.toTimeString().slice(0, 8).replace(/:/g, "");
    return parseInt(time.slice(0, 4), 10);
  }

  try {
    const count = await redisClient.incr(counterKey);

    // Set expiration on first token of the day
    if (count === 1) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const ttl = Math.floor((tomorrow - now) / 1000);
      await redisClient.expire(counterKey, ttl);
    }

    return count;
  } catch (error) {
    console.error("Redis INCR failed:", error.message);
    const time = now.toTimeString().slice(0, 8).replace(/:/g, "");
    return parseInt(time.slice(0, 4), 10);
  }
};

/**
 * Format internal Token ID: YYYYMMDD-XXX
 */
export const formatTokenId = (dailyCount, date = new Date()) => {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const counterStr = dailyCount.toString().padStart(3, "0");
  return `${dateStr}-${counterStr}`;
};

/**
 * Format customer-facing Token Number: PRE-XXX
 */
export const formatTokenNumber = (serviceId, dailyCount) => {
  const servicePrefix = serviceId.substring(0, 3).toUpperCase();
  const counterStr = dailyCount.toString().padStart(3, "0");
  return `${servicePrefix}-${counterStr}`;
};
