import { Server } from "socket.io";
import http from "http";
import express from "express";
import { setUserStatus} from "../controllers/auth.controller.js";
// import { generateResponse } from "../controllers/auth.controller.js";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: ["http://localhost:3000"],
		methods: ["GET", "POST"],
	},
});

export const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
	console.log("a user connected", socket.id);

	const userId = socket.handshake.query.userId;
	if (userId != "undefined") {
		setUserStatus(userId, 'AVAILABLE'); // Set user status as AVAILABLE on connection
		userSocketMap[userId] = socket.id;
	}

	// io.emit() is used to send events to all the connected clients
	io.emit("getOnlineUsers", Object.keys(userSocketMap));

	// socket.on() is used to listen to the events. can be used both on client and server side
	socket.on("disconnect", () => {
		console.log("user disconnected", socket.id);
		delete userSocketMap[userId];
		setUserStatus(userId, 'BUSY'); // Set user status as BUSY on disconnection
		io.emit("getOnlineUsers", Object.keys(userSocketMap));
	});
});




export { app, io, server };