// Backend API service for token operations

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function generateToken(service) {
  try {
    const response = await fetch(`${API_URL}/services/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ service }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const tokenData = await response.json();
    
    // Format response to match frontend expectations
    return {
      tokenNumber: tokenData.tokenNumber,
      counter: "Counter 1", // TODO: Get actual counter from backend
      waitTime: "15 minutes", // TODO: Calculate from queue length
      service: tokenData.service,
      timestamp: tokenData.timestamp,
    };
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
}

export async function getNextToken(service) {
  try {
    const response = await fetch(`${API_URL}/services/token/next/${service}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting next token:", error);
    throw error;
  }
}
