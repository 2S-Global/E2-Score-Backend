import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import {
    getAllFields,
    listFieldsByCompany
} from '../controllers/additionalFieldsController.js'; // Adjust the path according to your project structure


import userAuth from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
// Initialize dotenv to load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize router
const additionalFieldRouter = express.Router();

// Setup multer with memory storage for handling file uploads

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

additionalFieldRouter.post('/get_all_company_fields', upload.none(),userAuth, getAllFields);
additionalFieldRouter.post('/list_fields_by_company', upload.none(),userAuth, listFieldsByCompany);

export default additionalFieldRouter;