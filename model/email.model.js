// email.model.js
import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true, // Ensures emails are stored in lowercase
        trim: true // Removes any whitespace
    },
    subject: {
        type: String,
        required: false,
        default: '',
        trim: true
    },
    message: {
        type: String,
        required: false,
        default: '',
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Email = mongoose.model('Email', emailSchema);

export default Email;
