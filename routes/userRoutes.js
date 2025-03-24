import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import {
    registerUser,
    loginUser,
} from '../controllers/userController.js'; // Adjust the path according to your project structure

import userAuth from '../middleware/authMiddleware.js';

// Initialize dotenv to load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize router
const userRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Register user (assuming registration may need form data)
userRouter.post('/register', upload.none(), registerUser);

// Login user (use multer for form-data without files)
userRouter.post('/login', upload.none(), loginUser);


export default userRouter;
