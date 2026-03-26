import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import { addClient,getAllClients,deleteClient,updateClient } from "../../controllers/admin/ClientController.js";
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
const clientRoute = express.Router();
// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

clientRoute.get("/all-client",userAuth,getAllClients);
clientRoute.post("/add-client", upload.single("image"),userAuth,adminMiddleware, addClient);
clientRoute.post("/update-Client", upload.single("image"),userAuth,adminMiddleware, updateClient);
clientRoute.post("/delete-Client",userAuth,adminMiddleware,deleteClient);

export default clientRoute;
