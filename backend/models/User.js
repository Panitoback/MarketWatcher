const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Ensures username is unique
        trim: true // Removes whitespace from both ends of a string
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures email is unique
        match: [/.+@.+\..+/, 'Please enter a valid email address'] // Basic email format validation
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Minimum password length
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically sets the creation date
    }
}, {
    timestamps: true // Adds `createdAt` and `updatedAt` fields automatically
});

module.exports = mongoose.model('User', userSchema);