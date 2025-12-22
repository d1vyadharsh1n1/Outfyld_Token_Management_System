export const prevToken = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Previous token endpoint working"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};