import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import CallHistory from '../models/CallHistory.js';
import CallRating from '../models/CallRating.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'videochat_secret_key';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.json({ success: false, error: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.json({ success: false, error: 'Invalid token' });
    }
};

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email, password });
        await user.save();
        
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.json({ success: true, token, user: { username, email } });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

router.post('/check-username', async (req, res) => {
    try {
        const { username } = req.body;
        const existingUser = await User.findOne({ username });
        res.json({ available: !existingUser });
    } catch (error) {
        res.json({ available: true }); // Allow registration if check fails
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user || !(await user.comparePassword(password))) {
            return res.json({ success: false, error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.json({ success: true, token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Simple test route
router.post('/rate-call', (req, res) => {
    console.log('RATE CALL HIT');
    res.json({ success: true, message: 'Route working' });
});



// Get call history for authenticated user
router.get('/call-history', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.json({ success: false, error: 'User not found' });
        }
        
        const callHistory = await CallHistory.find({
            'participants.username': user.username,
            status: 'ended'
        }).sort({ startTime: -1 }).limit(50);
        
        res.json({ success: true, callHistory });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

console.log('Auth routes loaded with rate-call endpoint');

export default router;