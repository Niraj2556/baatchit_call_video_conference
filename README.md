# Baat Chit

A modern WebRTC-based video calling application with real-time chat and multi-user conference support.

## Features

- ✅ Modern glassmorphism UI design
- ✅ Username-based identification
- ✅ Peer-to-peer video calling
- ✅ Room-based connections
- ✅ Multi-user conference (like Google Meet)
- ✅ Real-time chat functionality
- ✅ Responsive grid layout
- ✅ URL-based room joining
- ✅ Mic/Camera toggle controls
- ✅ Participant count display
- ✅ Mobile-responsive design

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open browser and go to `http://localhost:3000`

## Usage

- Enter a room ID and click "Join Room"
- Share the URL with others: `http://localhost:3000?room=YOUR_ROOM_ID`
- Multiple users can join the same room for conference calls

## Deployment

### AWS EC2

1. Launch EC2 instance (Ubuntu 20.04+)
2. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. Clone and setup:
```bash
git clone <your-repo>
cd webrtc-video-call
npm install
```

4. Install PM2 and start:
```bash
sudo npm install -g pm2
pm2 start server.js --name "video-call"
pm2 startup
pm2 save
```

5. Configure security group to allow port 3000

### Render (Free)

1. Connect your GitHub repo to Render
2. Create new Web Service
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Auto-deploy on git push

### Railway (Free)

1. Connect GitHub repo to Railway
2. Deploy automatically detects Node.js
3. Set environment variables if needed
4. Get deployed URL

## Environment Variables

- `PORT`: Server port (default: 3000)

## HTTPS Note

For production, WebRTC requires HTTPS. Most hosting platforms provide SSL certificates automatically.