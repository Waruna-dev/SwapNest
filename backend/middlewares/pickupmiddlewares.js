// =======================
// PICKUP MIDDLEWARES
// =======================

// @desc  Validate required fields for pickup/center booking
export const validatePickupInput = (req, res, next) => {
  const { name, phone, method, address, center, date } = req.body;

  if (!name || !phone || !method || !date) {
    res.status(400);
    return next(new Error("Name, phone, method, and date are required"));
  }

  if (!["pickup", "center"].includes(method)) {
    res.status(400);
    return next(new Error("Method must be either 'pickup' or 'center'"));
  }

  if (method === "pickup" && !address) {
    res.status(400);
    return next(new Error("Address is required for pickup method"));
  }

  if (method === "center" && !center) {
    res.status(400);
    return next(new Error("Center selection is required for center method"));
  }

  next();
};

// @desc  Validate status value when updating pickup status
export const validatePickupStatus = (req, res, next) => {
  const { status } = req.body;

  const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];

  if (!status) {
    res.status(400);
    return next(new Error("Status field is required"));
  }

  if (!allowedStatuses.includes(status)) {
    res.status(400);
    return next(
      new Error(`Status must be one of: ${allowedStatuses.join(", ")}`)
    );
  }

  next();
};

// @desc  Validate MongoDB ObjectId format for :id params
export const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  const isValidId = /^[a-fA-F0-9]{24}$/.test(id);

  if (!isValidId) {
    res.status(400);
    return next(new Error(`Invalid ID format: ${id}`));
  }

  next();
};