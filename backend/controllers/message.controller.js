import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import {getUserStatus, generateResponse} from "./auth.controller.js"

export const sendMessage = async (req, res) => {
	try {
		const { message } = req.body;
		const { id: receiverId } = req.params;
		const senderId = req.user._id;

		// Check receiver's status
		const receiverStatus = await getUserStatus(receiverId);

		let responseMessage = message;
		// let newsenderId = senderId;
		let newreceiverId = receiverId;

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});
		}

		// console.log(message);


// generateResponse({"inputs": "Can you please let us know more details about your "}).then((response) => {
// 	console.log(JSON.stringify(response));
// });

		if (receiverStatus === 'BUSY') {



			const response = await generateResponse({ inputs: message });

			// Handle the response
			const data = response; // No need to stringify again, as response is already an object
			if (Array.isArray(data)) {
					// Handle array data
					const generatedMessage = data[0]['generated_text'];
					responseMessage = generatedMessage.split('\n')[0];
			} else {
					// Handle string data
					responseMessage = data;
			}

      console.log(responseMessage);

			newreceiverId = senderId;

		}

		const newMessage = new Message({
			senderId,
			receiverId: newreceiverId,
			message: responseMessage,
		});

		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

		// await conversation.save();
		// await newMessage.save();

		// this will run in parallel
		await Promise.all([conversation.save(), newMessage.save()]);

		// SOCKET IO FUNCTIONALITY WILL GO HERE
		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			// io.to(<socket_id>).emit() used to send events to specific client
			io.to(receiverSocketId).emit("newMessage", newMessage);
		}

		res.status(201).json(newMessage);
	} catch (error) {
		console.log("Error in sendMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error 1" });
	}
};

export const getMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user._id;

		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

		if (!conversation) return res.status(200).json([]);

		const messages = conversation.messages;

		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};