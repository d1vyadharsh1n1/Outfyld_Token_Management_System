import { redisClient, getIsConnected } from "../config/redis.js";

/**
 * Get daily counter from Redis
 * Counter resets daily and starts from 1 each day
 * Format: daily_counter:YYYYMMDD
 */
const getDailyCounter = async () => {
  if (!getIsConnected()) {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, "");
    const time = now.toTimeString().slice(0, 8).replace(/:/g, "");
    return `${date}${time.slice(0, 4)}`;
  }

  const now = new Date();
  const dateKey = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  
  const counterKey = `daily_counter:${dateKey}`;
  
  try {
    
    const count = await redisClient.incr(counterKey);
    
    
    if (count === 1) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const ttl = Math.floor((tomorrow - now) / 1000); 
      await redisClient.expire(counterKey, ttl);
    }
    
    return count;
  } catch (error) {
    console.error("Error getting daily counter:", error);
    
    const time = now.toTimeString().slice(0, 8).replace(/:/g, "");
    return parseInt(time.slice(0, 4), 10); 
  }
};


export const generateTokenId = async () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  
 
  const dailyCount = await getDailyCounter();
  
  // Format: YYYYMMDD-XXX (where XXX is 3-digit daily counter)
  const counterStr = dailyCount.toString().padStart(3, "0");
  
  return `${date}-${counterStr}`; // Max 11 characters
};

/**
 * Generate token number for display
 * Format: Service prefix + daily counter (e.g., DEP-001)
 * Uses the same daily counter as token_id for consistency
 */
export const generateTokenNumber = async (serviceId) => {
  const servicePrefix = serviceId.substring(0, 3).toUpperCase();
  
  // Get daily counter (same as token_id)
  const dailyCount = await getDailyCounter();
  const counterStr = dailyCount.toString().padStart(3, "0");
  
  return `${servicePrefix}-${counterStr}`;
};
