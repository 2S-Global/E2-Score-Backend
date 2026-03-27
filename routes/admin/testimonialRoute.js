import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import { addTestimonial,getAllTestimonials,deleteTestimonial,updateTestimonial } from "../../controllers/admin/TestimonialController.js";
//Middleware
import userAuth from "../../middleware/authMiddleware.js";
import adminMiddleware from '../../middleware/adminMiddleware.js';
// Initialize dotenv to load environment variables
dotenv.config();
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Initialize router
const testimonialRoute = express.Router();
// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

testimonialRoute.get("/all-testimonial",getAllTestimonials);
testimonialRoute.post("/add-testimonial", upload.single("image"),userAuth,adminMiddleware, addTestimonial);
testimonialRoute.post("/update-testimonial", upload.single("image"),userAuth,adminMiddleware, updateTestimonial);
testimonialRoute.post("/delete-testimonial",userAuth,adminMiddleware,deleteTestimonial);

export default testimonialRoute;
