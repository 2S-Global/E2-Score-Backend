import express from "express";

import {
  addCampus,
  getCampuses,
  getCampusById,
  updateCampus,
  deleteCampus,
} from "../../controllers/institute/instituteCampusControllers.js";

const router = express.Router();

router.post("/", addCampus);
router.get("/", getCampuses);
router.get("/:id", getCampusById);
router.put("/:id", updateCampus);
router.delete("/:id", deleteCampus);

export default router;
