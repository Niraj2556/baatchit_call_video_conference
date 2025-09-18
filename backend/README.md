# Baat Chit Backend

Backend server for the Baat Chit video calling application.

## Features

- Express.js server with Socket.IO for real-time communication
- MongoDB integration for user management and call history
- JWT authentication
- WebRTC signaling server
- Room management
- User authentication and registration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/check-username` - Check username availability
- `GET /health` - Health check endpoint

## Socket Events

- `create-room` - Create a new room
- `join-room` - Join an existing room
- `offer`, `answer`, `ice-candidate` - WebRTC signaling
- `chat-message` - Real-time chat messages
- `mute-status` - Microphone mute status updates

## Environment Variables

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string (currently hardcoded)
- `JWT_SECRET` - JWT secret key (currently hardcoded)