import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getUsersForSidebar} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUsersForSidebar);

// router.get("/:id", protectRoute, getStatus);

// router.post("/status/:id", protectRoute, updateStatus);

export default router;