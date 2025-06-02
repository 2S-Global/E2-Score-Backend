import express from "express";

import { test } from "../../controllers/candidate/userPersonalController.js";

// Initialize router
const userPersonalRouter = express.Router();

userPersonalRouter.get("/test", test);

export default userPersonalRouter;
