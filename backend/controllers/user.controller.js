import User from "../models/user.model.js";
import { setUserStatus , getUserStatus } from "./auth.controller.js";

export const getUsersForSidebar = async (req, res) => {
	try {
		const loggedInUserId = req.user._id;

		const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

		res.status(200).json(filteredUsers);
	} catch (error) {
		console.error("Error in getUsersForSidebar: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

//update user status
export const updateStatus = async (req, res) => {
	const { userId } = req.params;
	const { status } = req.body;

	try {
			const updateResult = await setUserStatus(userId, status);
			res.status(200).json(updateResult);
	} catch (error) {
			console.error("Error updating user status: ", error.message);
			res.status(500).json({ success: false, message: "Internal server error" });
	}
};

// get user status
export const getStatus = async (req, res) => {
	const { userId } = req.params;

	try {
			const status = await getUserStatus(userId);
			res.status(200).json({ status });
	} catch (error) {
			console.error("Error getting user status: ", error.message);
			res.status(500).json({ success: false, message: "Internal server error" });
	}
};