import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import { getAllFields, addServiceDetails, updateServiceDetails, getAllServiceDetails, deleteServiceDetails, addContact, listContact, addBanner, getAllBannners, updateBanner, deleteBanner } from "../controllers/allHomePageController.js";

// Initialize dotenv to load environment variables
dotenv.config();
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});





import userAuth from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

// Initialize router
const HomePageRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

HomePageRouter.get("/getBannerDetails", getAllFields);

HomePageRouter.get("/all-banner", getAllBannners);

HomePageRouter.post("/add-banner", upload.single("image"), userAuth, adminMiddleware, addBanner);

HomePageRouter.post("/update-banner", upload.single("image"), userAuth, adminMiddleware, updateBanner);

HomePageRouter.post("/delete-banner", upload.none(), userAuth, adminMiddleware, deleteBanner);

HomePageRouter.post("/add-service-details", upload.none(), userAuth, adminMiddleware, addServiceDetails);

HomePageRouter.put("/update-service-details/:id", upload.none(), userAuth, adminMiddleware, updateServiceDetails);

HomePageRouter.get("/get-service-details", getAllServiceDetails);

HomePageRouter.put("/delete-service-details/:id", upload.none(), userAuth, adminMiddleware, deleteServiceDetails);

HomePageRouter.post("/add-contact", upload.none(), addContact);

HomePageRouter.get("/list-contact-details", listContact);

export default HomePageRouter;