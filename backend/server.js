// Load environment variables from the .env file
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose'); // Import Mongoose for MongoDB connection

const app = express();
const PORT = process.env.PORT || 5000; // Server port, defaults to 5000 if not defined in .env

// Middleware to parse JSON in HTTP requests
app.use(express.json());

// MongoDB Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

// Initial test route
app.get('/', (req, res) => {
    res.send('Market Watcher API running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});