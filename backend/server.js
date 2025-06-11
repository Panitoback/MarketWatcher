require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes'); // <--- Make sure this line is here

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON in HTTP requests
app.use(express.json());

// Mount authentication routes <--- Make sure this block is here
// All routes in authRoutes.js will be prefixed with /api/auth
app.use('/api/auth', authRoutes); 

// MongoDB Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

// Initial test route (you can keep it for now, or remove it later if you want)
app.get('/', (req, res) => {
    res.send('Market Watcher API running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});