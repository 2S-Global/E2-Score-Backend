import express from "express";
import multer from "multer";
//controllers
import { AddtoCart } from "../../../controllers/candidate/cart/cartController.js";

//middleware
import userAuth from "../../../middleware/authMiddleware.js";
import Candimid from "../../../middleware/candidateMiddleware.js";

// Initialize router
const CandidateCartRouter = express.Router();
// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

CandidateCartRouter.post(
  "/add-to-cart",
  upload.none(),
  userAuth,
  Candimid,
  AddtoCart
);

export default CandidateCartRouter;
