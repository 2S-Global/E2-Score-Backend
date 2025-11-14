import express from "express";
import multer from "multer";

import { Adduser, Updateuser } from "../../controllers/admin/usercontroller.js";

//Middleware
import userAuth from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

// Initialize router
const UserAdminRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

UserAdminRouter.post(
  "/add_user",
  upload.none(),
  userAuth,
  adminMiddleware,
  Adduser
);

UserAdminRouter.put(
  "/update_user",
  upload.none(),
  userAuth,
  adminMiddleware,
  Updateuser
);

export default UserAdminRouter;
