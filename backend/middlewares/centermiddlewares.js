const { body, validationResult } = require("express-validator");

// ── Validation rules for creating / updating a center ──────────────────────
const validateCenter = [
  body("centerName")
    .trim()
    .notEmpty()
    .withMessage("Center name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Center name must be between 3 and 100 characters"),

  body("district")
    .notEmpty()
    .withMessage("District is required")
    .isIn([
      "Colombo", "Gampaha", "Kalutara", "Kandy", "Galle",
      "Matara", "Jaffna", "Trincomalee", "Kurunegala", "Ratnapura", "Badulla",
    ])
    .withMessage("Invalid district selected"),

  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .isLength({ min: 2, max: 60 })
    .withMessage("City must be between 2 and 60 characters"),

  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Address must be between 5 and 200 characters"),

  body("contactNumber")
    .notEmpty()
    .withMessage("Contact number is required")
    .matches(/^\+?[0-9]{7,15}$/)
    .withMessage("Please provide a valid contact number"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("managerName")
    .trim()
    .notEmpty()
    .withMessage("Manager name is required")
    .isLength({ min: 2, max: 80 })
    .withMessage("Manager name must be between 2 and 80 characters"),

  body("managerContact")
    .notEmpty()
    .withMessage("Manager contact is required")
    .matches(/^\+?[0-9]{7,15}$/)
    .withMessage("Please provide a valid manager contact number"),

  body("capacity")
    .notEmpty()
    .withMessage("Capacity is required")
    .isInt({ min: 1, max: 10000 })
    .withMessage("Capacity must be a positive number (max 10,000)"),

  body("operatingHours.open")
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Opening time must be in HH:MM format"),

  body("operatingHours.close")
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Closing time must be in HH:MM format"),

  body("operatingDays")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one operating day must be selected"),

  body("facilities")
    .optional()
    .isArray()
    .withMessage("Facilities must be an array"),

  body("status")
    .optional()
    .isIn(["Active", "Inactive", "Under Maintenance"])
    .withMessage("Status must be Active, Inactive, or Under Maintenance"),

  body("latitude")
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),

  body("longitude")
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
];

// ── Validation rules for partial update (PATCH) ────────────────────────────
const validateCenterUpdate = [
  body("centerName")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Center name must be between 3 and 100 characters"),

  body("district")
    .optional()
    .isIn([
      "Colombo", "Gampaha", "Kalutara", "Kandy", "Galle",
      "Matara", "Jaffna", "Trincomalee", "Kurunegala", "Ratnapura", "Badulla",
    ])
    .withMessage("Invalid district selected"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("contactNumber")
    .optional()
    .matches(/^\+?[0-9]{7,15}$/)
    .withMessage("Please provide a valid contact number"),

  body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive number"),

  body("status")
    .optional()
    .isIn(["Active", "Inactive", "Under Maintenance"])
    .withMessage("Status must be Active, Inactive, or Under Maintenance"),
];

// ── Middleware: handle validation errors ───────────────────────────────────
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// ── Middleware: validate MongoDB ObjectId in URL params ────────────────────
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: "Invalid center ID format",
    });
  }
  next();
};

// ── Middleware: check required query params for district/city search ────────
const validateSearchQuery = (req, res, next) => {
  const { district, city } = req.query;
  if (district && !["Colombo","Gampaha","Kalutara","Kandy","Galle","Matara","Jaffna","Trincomalee","Kurunegala","Ratnapura","Badulla"].includes(district)) {
    return res.status(400).json({
      success: false,
      message: "Invalid district filter value",
    });
  }
  next();
};

module.exports = {
  validateCenter,
  validateCenterUpdate,
  handleValidationErrors,
  validateObjectId,
  validateSearchQuery,
};