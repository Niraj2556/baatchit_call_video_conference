import mongoose from 'mongoose';

const callHistorySchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true
    },
    participants: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        joinTime: Date,
        leaveTime: Date
    }],
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: Date,
    duration: Number, // in seconds
    status: {
        type: String,
        enum: ['active', 'ended'],
        default: 'active'
    },
    ratings: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

export default mongoose.model('CallHistory', callHistorySchema);