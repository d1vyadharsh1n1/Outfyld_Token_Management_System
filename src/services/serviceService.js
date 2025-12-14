export const updateService = (id, data) => {
  const index = services.findIndex(s => s.id === Number(id));

  if (index === -1) {
    return null;
  }

  services[index] = { ...services[index], ...data };
  return services[index];
};
import { addToQueue, getNextFromQueue } from "../redis/redis.js";

export const createToken = async (req) => {
  const token = {
    tokenNumber: Date.now(),
    service: req.body.service
  };

  await addToQueue(req.body.service, token);
  return token;
};

export const serveNextToken = async (service) => {
  return await getNextFromQueue(service);
};