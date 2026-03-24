import express from "express";
import upload from "../middlewares/item-upload.js";
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getNearbyItems,
  getSuggestions,
  getTrendingItems,
  getSimilarItems,
} from "../controllers/itemController.js";

const router = express.Router();

// LIST + CREATE
router.get("/", getItems);
router.post("/", upload.array("images", 5), createItem);

// SPECIAL LISTING
router.get("/nearby", getNearbyItems);
router.get("/suggestions", getSuggestions);
router.get("/trending", getTrendingItems);

// SIMILAR
router.get("/:id/similar", getSimilarItems);

// READ ONE + UPDATE + DELETE
router.get("/:id", getItemById);
router.put("/:id", upload.array("images", 5), updateItem);
router.delete("/:id", deleteItem);

export default router;