
# Real-Time Chat Application Backend

This is the backend component of a real-time chat application developed using the MERN stack (MongoDB, Express.js, React.js, Node.js). The backend emphasizes user authentication, real-time messaging using Socket.io, message storage in MongoDB, user online status management, and integration with a language model API for generating responses.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Documentation](#documentation)
  - [Setup and Run Instructions](#setup-and-run-instructions)
  - [API Route Descriptions](#api-route-descriptions)
  - [Environment Configurations](#environment-configurations)


## Overview

The chat application allows users to send and receive messages in real-time. It's built using Node.js, Express.js, and Socket.IO. Users can sign up with an fullname , username , profilepic and password and utilize JWT (JSON Web Tokens) for managing authentication. Messages are stored in MongoDB, and users can set their status as 'AVAILABLE' or 'BUSY'. If a recipient is 'BUSY', an appropriate response is automatically generated using a language model API.

## Features

1. **User Authentication**:
   - Implements a registration and login system.
   - Users sign up with an fullname , username , profilepic and password.
   - Uses JWT (JSON Web Tokens) for managing authentication.

2. **Chat Functionality**:
   - Users can send and receive real-time messages.
   - Utilizes Socket.io for efficient real-time communication.

3. **Message Storage**:
   - Stores all messages in MongoDB.
   - Ensures messages in chat are retrievable for conversation between people.

4. **User Online Status and LLM Integration**:
   - Users can set their status as 'AVAILABLE' or 'BUSY'.
   - Users can only chat if they are online. If the recipient is 'BUSY', automatically generates an appropriate response using a language model API .
   - API Response from the language model (LLM) API is sent within 10 seconds. If the LLM API does not respond in 10 seconds, then we are sending a standard message indicating the user is unavailable.

## Documentation

### Setup and Run Instructions

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Run following commands:           
    1. `npm init -y`  
    2.`npm install express dotenv cookie-parser bcryptjs mongoose socket.io jsonwebtoken axios`

3. Install dependencies using `npm install -D nodemon`.
4. Configure environment variables:
    - **PORT ,** **MONGO_DB_URI ,** **JWT_SECRET ,** **NODE_ENV ,** **LLM_API_URL ,** **LLM_API_TOKEN**

5. update Package.json:
    1. "scripts": {
    "server": "nodemon -r dotenv/config --experimental-json-modules backend/server.js"
    },
    "type": "module",
    
5. Start the server using `npm run server`.

### API Route Descriptions

- **User Authentication**:
  - `POST /api/auth/signup`: Register a new user.
    - Request Body: `{ 
    "fullName" : "user",
    "username" : "user",
    "password" : "password123",
    "confirmPassword" : "password123",
    "gender": "male"
}`
    - Response: `{
    "_id": "<user_.id>",
    "fullName": "user",
    "username": "user",
    "profilePic": "https://avatar.iran.liara.run/public/boy?username=user",
    "status": "AVAILABLE"
}`
  - `POST /api/auth/login`: Login a user.
    - Request Body: `{ "username": "user", "password": "password123" }`
    - Response: `{
    "_id": "<user_.id>",
    "fullName": "user",
    "username": "user",
    "profilePic": "https://avatar.iran.liara.run/public/boy?username=user",
    "status": "AVAILABLE"
}`
  - `POST /api/auth/logout`: Logout a user.
    - Response: `{"message": "Logged out successfully"}`

- **Chat Functionality**:
  - `POST /api/messages/send/:id`: Send a message to a user.
    - Request Body: `{"message": "Hello, world!" }`
    - Response: `{
    "senderId": "<sender_id>",
    "receiverId": "<reciever_id>",
    "message": "<message>",
    "_id": "<message_id>",
    "createdAt": "creation time",
    "updatedAt": "updation time",
    "__v": 0
}`
  - `GET /api/messages/:recipientId`: Get messages exchanged with a specific user.
    - Response: `[{
    "senderId": "<sender_id>",
    "receiverId": "<reciever_id>",
    "message": "<message>",
    "_id": "<message_id>",
    "createdAt": "creation time",
    "updatedAt": "updation time",
    "__v": 0
}]`

- **get All Users**:
- `GET /api/users`: Get all users except currently loggined user.
    - Response: `[{
    "_id": "<user_.id>",
    "fullName": "user",
    "username": "user",
    "profilePic": "https://avatar.iran.liara.run/public/boy?username=user",
    "status": "AVAILABLE",
    "createdAt": "creation time",
    "updatedAt": "updation time"
},
{
    "_id": "<user_.id>",
    "fullName": "user",
    "username": "user",
    "profilePic": "https://avatar.iran.liara.run/public/boy?username=user",
    "status": "AVAILABLE",
    "createdAt": "creation time",
    "updatedAt": "updation time"
}]`

- **User Online Status and LLM Integration**:
  - `POST /api/users/status/:id`: Set user online status.
    - Request Body: `{ "status": "AVAILABLE" }`
    - Response: `{ "success": true, "message": "User status updated successfully." }`
  - `GET /api/users/:id`: Get user online status.
    - Response: `{ "status": "AVAILABLE" }`



### Environment Configurations

Ensure the following environment variables are configured:
- `MONGODB_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret key for JWT token generation.
- `LLM_API_KEY`: API key for accessing the language model API i.e huggingface (model - mistral 7b).
- `LLM_API_TOKEN`:API token for huggingface model


