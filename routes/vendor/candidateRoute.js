import express from "express";
import multer from "multer";
import {
  addCandidate,
  deleteCandidate,
  getCandidate,
  listCandidates,
  updateCandidate,
  listEmployerSubmitRequest,
  employerSubmitRequest,
} from "../../controllers/vendor/candidateController.js";
import userAuth from "../../middleware/authMiddleware.js";
import VendorMiddleware from "../../middleware/vendorMiddleware.js";

const candidateRouter = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (
      file.mimetype !== "application/pdf" ||
      !file.originalname.toLowerCase().endsWith(".pdf")
    ) {
      const error = new Error("Only PDF CV files are allowed.");
      error.statusCode = 422;
      return callback(error);
    }
    return callback(null, true);
  },
});

const uploadCv = (req, res, next) => {
  upload.single("cv")(req, res, (error) => {
    if (!error) return next();
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "CV file must be 10 MB or smaller.",
      });
    }
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Unable to process CV upload.",
    });
  });
};

candidateRouter.use(userAuth, VendorMiddleware);
candidateRouter.post("/", uploadCv, addCandidate);
candidateRouter.get("/", listCandidates);

candidateRouter.get("/employer-request", listEmployerSubmitRequest);
candidateRouter.get("/single-employer-request", employerSubmitRequest);
candidateRouter.get("/:id", getCandidate);
candidateRouter.put("/:id", uploadCv, updateCandidate);
candidateRouter.delete("/:id", deleteCandidate);
export default candidateRouter;
