import { body, validationResult } from "express-validator";

export const validateCenter = [
  body("centerName").trim().notEmpty().withMessage("Center name is required"),
  body("district").notEmpty().withMessage("District is required")
    .isIn(["Colombo","Gampaha","Kalutara","Kandy","Galle","Matara","Jaffna","Trincomalee","Kurunegala","Ratnapura","Badulla"])
    .withMessage("Invalid district"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("contactNumber").notEmpty().withMessage("Contact number is required"),
  body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email").normalizeEmail(),
  body("managerName").trim().notEmpty().withMessage("Manager name is required"),
  body("managerContact").notEmpty().withMessage("Manager contact is required"),
  body("capacity").notEmpty().withMessage("Capacity is required").isInt({ min: 1 }).withMessage("Capacity must be a positive number"),
  body("status").optional().isIn(["Active","Inactive","Under Maintenance"]).withMessage("Invalid status"),
  body("operatingDays").optional().isArray({ min: 1 }).withMessage("Select at least one operating day"),
  body("facilities").optional().isArray().withMessage("Facilities must be an array"),
];

export const validateCenterUpdate = [
  body("centerName").optional().trim().isLength({ min: 3 }).withMessage("Center name too short"),
  body("district").optional()
    .isIn(["Colombo","Gampaha","Kalutara","Kandy","Galle","Matara","Jaffna","Trincomalee","Kurunegala","Ratnapura","Badulla"])
    .withMessage("Invalid district"),
  body("email").optional().isEmail().withMessage("Invalid email").normalizeEmail(),
  body("contactNumber").optional().matches(/^\+?[0-9]{7,15}$/).withMessage("Invalid contact number"),
  body("capacity").optional().isInt({ min: 1 }).withMessage("Capacity must be a positive number"),
  body("status").optional().isIn(["Active","Inactive","Under Maintenance"]).withMessage("Invalid status"),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

export const validateObjectId = (req, res, next) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: "Invalid center ID format" });
  }
  next();
};

export const validateSearchQuery = (req, res, next) => {
  const { district } = req.query;
  const valid = ["Colombo","Gampaha","Kalutara","Kandy","Galle","Matara","Jaffna","Trincomalee","Kurunegala","Ratnapura","Badulla"];
  if (district && !valid.includes(district)) {
    return res.status(400).json({ success: false, message: "Invalid district filter" });
  }
  next();
};