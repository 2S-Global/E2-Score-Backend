import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import {
    addUserSkills,
    listUserSkills,
    deleteUserSkill
} from '../controllers/userSkillsController.js'; // Adjust the path according to your project structure

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

userRouter.post('/add_user_skills', addUserSkills);
userRouter.post('/list_user_skills', listUserSkills);
userRouter.post('/delete_user_skills', deleteUserSkill);

export default userRouter;
