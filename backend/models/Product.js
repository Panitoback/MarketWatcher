const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({ // Corrected: removed extra 'new'
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User who is monitoring this product
        ref: 'User', // Refers to the 'User' model
        required: true
    },
    url: {
        type: String,
        required: true,
        unique: false, // Changed to 'false'. Multiple users might want to monitor the same URL.
        trim: true
    },
    name: {
        type: String,
        required: false // Can be populated by scraping or left null initially
    },
    imageUrl: {
        type: String, // URL of the product image
        default: null
    },
    initialPrice: {
        type: Number, // Price when first added
        required: true
    },
    currentPrice: {
        type: Number, // Latest scraped price
        required: true
    },
    targetPrice: {
        type: Number, // The price the user wants to be notified at
        required: true
    },
    lastScrapedAt: {
        type: Date, // When was this product last checked
        default: Date.now
    },
    status: {
        type: String, // e.g., 'active', 'paused', 'error'
        enum: ['active', 'paused', 'error'],
        default: 'active'
    },
    // Optional: Can add a priceHistory array later for charting
    // priceHistory: [
    //     {
    //         price: { type: Number, required: true },
    //         date: { type: Date, default: Date.now }
    //     }
    // ]
}, {
    timestamps: true // Adds `createdAt` and `updatedAt` fields automatically
});

module.exports = mongoose.model('Product', productSchema);