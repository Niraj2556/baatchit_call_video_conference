# Baat Chit Backend

Backend server for the Baat Chit video calling application.

## Features

- WebRTC signaling server
- User authentication with JWT
- Real-time chat messaging
- Call history tracking
- MongoDB integration

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/your-database
JWT_SECRET=your-jwt-secret-key
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your configuration

3. Start development server:
```bash
npm run dev
```

## Deployment to Vercel

1. Push this repository to GitHub
2. Connect your GitHub repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string
   - `CORS_ORIGIN`: Your frontend domain (e.g., https://your-app.vercel.app)
4. Deploy

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/check-username` - Check username availability
- `GET /api/auth/call-history` - Get user's call history
- `GET /health` - Health check

## Socket Events

- `join-room` - Join a video call room
- `user-joined` - Notify when user joins
- `user-left` - Notify when user leaves
- `offer`, `answer`, `ice-candidate` - WebRTC signaling
- `chat-message` - Real-time chat messages