import express from "express";
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getNearbyItems,
} from "../controller/itemController.js";

const router = express.Router();
// CREATE ITEM
router.get("/nearby", getNearbyItems);
//
router.get("/", getItems);
router.get("/:id", getItemById);
router.post("/", createItem);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

export default router;
