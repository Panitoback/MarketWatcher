require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const { startPriceScrapingJob } = require('./jobs/priceScraperJob'); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully.');
        console.log('Attempting to start price scraping job...');
        startPriceScrapingJob();
    })
    .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.send('Market Watcher API running!');
});

app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});