import express from "express";
import {
  insertFakeContacts,
  getAllContacts,
  updateContact,
} from "../../controllers/admin/contactInfoController.js";

const router = express.Router();

// Insert fake data
router.post("/insert-fake", insertFakeContacts);

// Get all contacts
router.get("/all", getAllContacts);

// Update contact
router.put("/update/:id", updateContact);

export default router;
