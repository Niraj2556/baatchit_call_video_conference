import VideoCallApp from './src/server/app.js';

const videoCallApp = new VideoCallApp();
const app = videoCallApp.app;

// For Vercel serverless functions
if (process.env.VERCEL) {
  export default app;
} else {
  videoCallApp.start();
}