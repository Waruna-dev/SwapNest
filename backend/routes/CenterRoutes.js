import express from "express";
import {
  getAllCenters,
  getCenterById,
  createCenter,
  updateCenter,
  patchCenter,
  deleteCenter,
  updateVolunteerCount,
  getCentersByDistrict,
  getActiveCentersCount,
} from "../controllers/CenterController.js";

import {
  validateCenter,
  validateCenterUpdate,
  handleValidationErrors,
  validateObjectId,
  validateSearchQuery,
} from "../middlewares/centermiddlewares.js";

const router = express.Router();

router
  .route("/")
  .get(validateSearchQuery, getAllCenters)
  .post(validateCenter, handleValidationErrors, createCenter);

router.get("/district/:district", getCentersByDistrict);
router.get("/active/count", getActiveCentersCount);

router
  .route("/:id")
  .get(validateObjectId, getCenterById)
  .put(validateObjectId, validateCenter, handleValidationErrors, updateCenter)
  .patch(validateObjectId, validateCenterUpdate, handleValidationErrors, patchCenter)
  .delete(validateObjectId, deleteCenter);

router.patch("/:id/volunteer-count", validateObjectId, updateVolunteerCount);

export default router;