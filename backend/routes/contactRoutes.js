import express from "express";
import { createContactMessage } from "../controllers/contactController.js";
import { uploadContactAttachment } from "../middlewares/contactUpload.js";

const router = express.Router();

router.post("/", uploadContactAttachment, createContactMessage);

export default router;
