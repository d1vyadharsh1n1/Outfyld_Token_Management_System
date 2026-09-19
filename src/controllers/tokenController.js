import { TokenHistory, Service } from "../models/index.js";

/**
 * Fetch the last completed/served token for a given counter
 */
export const prevToken = async (req, res) => {
  try {
    const { counter_id } = req.body;

    if (!counter_id) {
      return res.status(400).json({
        success: false,
        error: "counter_id is required in request body",
      });
    }

    const previousToken = await TokenHistory.findOne({
      where: {
        assigned_counter_id: counter_id,
        status: "served",
      },
      order: [["served_timestamp", "DESC"]],
      include: [{ model: Service, as: "service", attributes: ["service_id", "name"] }],
    });

    if (!previousToken) {
      return res.status(404).json({
        success: false,
        message: `No previously served token found for counter ${counter_id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: previousToken,
    });
  } catch (error) {
    console.error("Previous token lookup error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
