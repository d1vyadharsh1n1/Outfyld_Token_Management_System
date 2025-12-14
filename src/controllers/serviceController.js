export const createService = (req, res) => {
  const { name, status } = req.body;

  const newService = {
    id: Date.now(),
    name,
    status
  };

  res.status(201).json({
    success: true,
    data: newService
  });
};
export const getServices = (req, res) => {
  res.status(200).json
  ({
    success: true,
    data: []
  });
};
export const updateService = (req, res) => {
  const { id } = req.params;

  res.status(200).json({
    success: true,
    data: {
      id,
      ...req.body
    }
  });
};
export const deleteService = (req, res) => {
  const { id } = req.params;

  res.status(200).json({
    success: true,
    message: `Service ${id} deleted`
  });
  if (!req.body.name) {
  return res.status(400).json({ error: "Name is required" });
}
};
export const generateToken = async (req, res) => {
  const token = await createToken(req);
  res.json(token);
};

export const callNextToken = async (req, res) => {
  const next = await serveNextToken(req.params.service);
  res.json(next || { message: "No tokens in queue" });
};
export const prevToken = (req, res) => {
  res.json({
    success: true,
    message: "Previous token logic will go here"
  });
};