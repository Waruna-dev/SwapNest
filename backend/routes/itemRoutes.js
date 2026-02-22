import express from "express";
import upload from "../middlewares/item.imgMiddleware.js";
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getNearbyItems,
} from "../controllers/itemController.js";

const router = express.Router();

// CREATE ITEM
router.post("/", upload.array("images", 5), createItem);

router.get("/nearby", getNearbyItems);
router.get("/", getItems);
router.get("/:id", getItemById);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

export default router;
