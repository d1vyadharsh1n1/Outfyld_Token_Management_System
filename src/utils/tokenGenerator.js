// Professional token ID generator
// Format: YYYYMMDD-HHMMSS-XXX (e.g., 20251220-143052-001)
// Prevents collisions by using timestamp + random suffix

export const generateTokenId = () => {
  const now = new Date();
  
  // Format: YYYYMMDD
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  
  // Format: HHMMSS
  const time = now.toTimeString().slice(0, 8).replace(/:/g, "");
  
  // Random 3-digit suffix to prevent collisions (even if same millisecond)
  const randomSuffix = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  
  return `${date}-${time}-${randomSuffix}`;
};

// Generate token number for display (shorter format)
export const generateTokenNumber = (serviceId) => {
  // Format: Service prefix + timestamp + random
  // e.g., DEP-143052-42
  const servicePrefix = serviceId.substring(0, 3).toUpperCase();
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "");
  const random = Math.floor(Math.random() * 100).toString().padStart(2, "0");
  
  return `${servicePrefix}-${timeStr}-${random}`;
};
