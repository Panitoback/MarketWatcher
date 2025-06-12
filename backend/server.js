require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes'); // NEW LINE

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // NEW LINE

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.send('Market Watcher API running!');
});

app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});