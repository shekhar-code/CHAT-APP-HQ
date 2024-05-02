import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getUsersForSidebar , getStatus , updateStatus} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUsersForSidebar);

router.get("/:userId", protectRoute, getStatus);

router.post("/status/:userId", protectRoute, updateStatus);

export default router;