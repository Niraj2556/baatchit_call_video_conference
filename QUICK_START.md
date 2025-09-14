# Baat Chit - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js (v14+)
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation
```bash
# 1. Navigate to project directory
cd chat_call_proj

# 2. Install dependencies
npm install

# 3. Start the server
npm start

# 4. Open browser
# Go to http://localhost:3000
```

### First Use
1. **Enter Username** - Type your name
2. **Enter Room ID** - Create or join a room (e.g., "meeting123")
3. **Allow Camera/Mic** - Click "Allow" when browser asks
4. **Share Room Link** - Copy URL and share with others
5. **Start Video Calling** - Others can join using the same room ID

### Key Features
- **Video Calling** - Multi-user conference support
- **Real-time Chat** - Click chat icon in header
- **Mute Controls** - Toggle microphone and camera
- **Smart Audio** - Mic icons show when speaking
- **Room Sharing** - Use URL: `http://localhost:3000?room=YOUR_ROOM_ID`

### Troubleshooting
- **No video/audio?** → Check browser permissions
- **Can't connect?** → Ensure port 3000 is available
- **Performance issues?** → Close other browser tabs

### File Structure
```
chat_call_proj/
├── server.js          # Backend server
├── public/
│   ├── index.html     # Main page
│   ├── js/app.js      # Frontend logic
│   └── css/style.css  # Styling
└── package.json       # Dependencies
```

### Deployment
- **Local**: `npm start` → http://localhost:3000
- **Render**: Connect GitHub repo → Auto-deploy
- **Railway**: Connect GitHub repo → Auto-deploy
- **AWS EC2**: Install Node.js → Clone → `npm install` → `npm start`

For detailed documentation, see `DOCUMENTATION.md`