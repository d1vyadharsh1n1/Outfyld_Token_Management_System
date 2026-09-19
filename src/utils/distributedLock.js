import crypto from "crypto";
import { redisClient, getIsConnected } from "../config/redis.js";

/**
 * Acquire a distributed lock.
 * @param {string} resource - Lock key identifier (e.g. 'lock:counter:1')
 * @param {number} ttlMs - Time-to-live in milliseconds
 * @returns {Promise<string|null>} lockId if acquired, null if contention failed
 */
export const acquireLock = async (resource, ttlMs = 5000) => {
  if (!getIsConnected()) {
    console.warn("Redis unavailable: Bypassing distributed lock");
    return null;
  }

  const lockId = crypto.randomUUID();
  // NX: Set if Not eXists, PX: Expire in milliseconds (prevents deadlocks on crashes)
  const acquired = await redisClient.set(resource, lockId, {
    NX: true,
    PX: ttlMs,
  });

  return acquired === "OK" ? lockId : null;
};

/**
 * Release lock using atomic Lua script (releases ONLY if lockId matches)
 * @param {string} resource - Lock key identifier
 * @param {string} lockId - Unique lock identifier returned by acquireLock
 */
export const releaseLock = async (resource, lockId) => {
  if (!getIsConnected() || !lockId) return false;

  // Lua script: Read key, compare with lockId, and delete if matching.
  // Guarantees process A does not release process B's expired lock.
  const luaScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;

  try {
    const result = await redisClient.eval(luaScript, {
      keys: [resource],
      arguments: [lockId],
    });
    return result === 1;
  } catch (error) {
    console.error(`Failed to release lock for ${resource}:`, error.message);
    return false;
  }
};
