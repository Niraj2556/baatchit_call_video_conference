# Baat Chit Frontend

Frontend application for the Baat Chit video calling platform.

## Features

- WebRTC video calling
- Real-time chat messaging
- User authentication
- Call history
- Responsive design

## Configuration

Before deployment, update the backend URL in `/public/js/config.js`:

```javascript
// Replace 'your-backend-domain.vercel.app' with your actual backend URL
BACKEND_URL: 'https://your-backend-domain.vercel.app'
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## Deployment to Vercel

### Method 1: Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts

### Method 2: GitHub Integration
1. Push this repository to GitHub
2. Connect your GitHub repository to Vercel
3. Deploy automatically

## Post-Deployment Setup

1. After deploying both frontend and backend:
   - Update the backend URL in `/public/js/config.js`
   - Update the CORS_ORIGIN environment variable in your backend deployment
   - Redeploy both applications

## Project Structure

```
public/
├── index.html          # Main video call interface
├── auth.html          # Login/Register page
├── history.html       # Call history page
├── css/
│   └── style.css      # Application styles
└── js/
    ├── config.js      # Environment configuration
    ├── app.js         # Main application logic
    ├── auth.js        # Authentication logic
    ├── history.js     # Call history logic
    ├── modules/       # Core modules
    └── utils/         # Utility functions
```

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

WebRTC features require HTTPS in production.