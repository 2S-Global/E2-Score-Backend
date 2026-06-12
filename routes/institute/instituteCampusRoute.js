import express from "express";
import multer from "multer";
import {
  addCampus,
  getCampuses,
  getCampusById,
  updateCampus,
  deleteCampus,
} from "../../controllers/institute/instituteCampusControllers.js";
import userAuth from "../../middleware/authMiddleware.js";
import Institutemid from "../../middleware/InstituteMiddleware.js";
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post("/", userAuth, Institutemid, upload.none(), addCampus);
router.get("/", userAuth, Institutemid, upload.none(), getCampuses);
router.get("/:id", userAuth, Institutemid, upload.none(), getCampusById);
router.put("/:id", userAuth, Institutemid, upload.none(), updateCampus);
router.delete("/:id", userAuth, Institutemid, upload.none(), deleteCampus);

export default router;
