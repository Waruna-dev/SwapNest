import express from "express";
import uploadImages from "../middlewares/item.imgMiddleware.js";
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
router.post("/", uploadImages, createItem);

router.get("/nearby", getNearbyItems);
router.get("/", getItems);
router.get("/:id", getItemById);
router.put("/:id", uploadImages, updateItem);
router.delete("/:id", deleteItem);

export default router;
