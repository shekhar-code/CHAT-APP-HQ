import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import axios from 'axios';
import {getLLMResponse} from "../utils/mockLLMResponse.js"


export const signup = async (req, res) => {
	try {
		const { fullName, username, password, confirmPassword, gender } = req.body;

		if (password !== confirmPassword) {
			return res.status(400).json({ error: "Passwords don't match" });
		}

		const user = await User.findOne({ username });

		if (user) {
			return res.status(400).json({ error: "Username already exists" });
		}

		// HASH PASSWORD HERE
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// https://avatar-placeholder.iran.liara.run/

		const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
		const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

		const newUser = new User({
			fullName,
			username,
			password: hashedPassword,
			gender,
			profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
			status: 'AVAILABLE',
		});

		if (newUser) {
			// Generate JWT token here
			generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();

			res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				profilePic: newUser.profilePic,
				status: newUser.status,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		// Set user status to 'AVAILABLE' upon successful login
		const statusUpdateResult = await setUserStatus(user._id, 'AVAILABLE');
		if (!statusUpdateResult.success) {
				throw new Error(statusUpdateResult.message);
		}        

		generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			profilePic: user.profilePic,
			status: 'AVAILABLE',
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout = async (req, res) => {
	try {

		const userId = req.user._id; // Assuming you have middleware to extract user information from the request
		const statusUpdateResult = await setUserStatus(userId, 'BUSY'); // Update user status to 'BUSY'
		if (!statusUpdateResult.success) {
				throw new Error(statusUpdateResult.message);
		}

		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

// Function to set user status
export const setUserStatus = async (userId, status) => {
	try {
			await User.findByIdAndUpdate(userId, { status });
			return { success: true, message: 'User status updated successfully' };
	} catch (error) {
			return { success: false, message: 'Failed to update user status' };
	}
};

import mongoose from 'mongoose';

export const getUserStatus = async (userId) => {
	try {
		if (!mongoose.isValidObjectId(userId)) {
			// Return 'AVAILABLE' if userId is not a valid ObjectId
			return 'AVAILABLE';
		}

		const user = await User.findById(userId);
		return user ? (user.status || 'AVAILABLE') : 'AVAILABLE'; // Return user status if user exists, otherwise return 'AVAILABLE'
	} catch (error) {
		console.log("Error in getUserStatus function: ", error.message);
		return 'BUSY'; // Default status if error occurs
	}
};
// Function to generate response using LLM API

export const generateResponse = async (message) => {

    try {
        const responsePromise = fetch(
            process.env.LLM_API_URL,
            {
                headers: { 
                    'Authorization': `Bearer ${process.env.LLM_API_TOKEN}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify(message),
            }
        );

        // Set a timeout for the response promise
        const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve({ message: 'Sorry, the user is currently unavailable.' });
            }, 10000); // 10 seconds timeout
        });

        // Race between the response promise and the timeout promise
        const response = await Promise.race([responsePromise, timeoutPromise]);
        
        if (!response.ok) {
            throw new Error('LLM API response error');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        // Handle the scenario where LLM API is not available or response timeout
        // Return the response from the mock function
        return await getLLMResponse(message);
    }
};
