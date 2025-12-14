import redis from "redis";

export const redisClient = redis.createClient({
  url: "redis://127.0.0.1:6379"
});

redisClient.on("connect", () => {
  console.log("Redis connected");
});

await redisClient.connect();

// ADD THESE FUNCTIONS 👇

export const addToQueue = async (serviceName, token) => {
  await redisClient.rPush(serviceName, JSON.stringify(token));
};

export const getNextFromQueue = async (serviceName) => {
  const data = await redisClient.lPop(serviceName);
  return data ? JSON.parse(data) : null;
};