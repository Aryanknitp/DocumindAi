import express from "express";
import { protect } from "../middleware/auth.js";
import {
  listCollections,
  createCollection,
  addDocumentToCollection,
} from "../controllers/collectionController.js";

const router = express.Router();
router.use(protect);
router.get("/", listCollections);
router.post("/", createCollection);
router.post("/:id/documents", addDocumentToCollection);
export default router;
