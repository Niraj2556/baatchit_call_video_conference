import VideoCallApp from '../src/app.js';

let app;

export default function handler(req, res) {
    if (!app) {
        app = new VideoCallApp();
    }
    
    app.app(req, res);
}