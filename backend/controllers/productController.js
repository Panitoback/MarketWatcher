const Product = require('../models/Product'); // Import the Product model
const { scrapeProduct } = require('../utils/scraper'); // Import the scraper utility

// @desc    Add a new product to monitor
// @route   POST /api/products
// @access  Private (requires authentication)
exports.addProduct = async (req, res) => {
    const { url, targetPrice } = req.body;
    const userId = req.user.id; // Get user ID from authenticated request

    if (!url || !targetPrice) {
        return res.status(400).json({ message: 'Please provide product URL and target price.' });
    }

    try {
        // Check if user is already monitoring this URL
        const existingProduct = await Product.findOne({ userId, url });
        if (existingProduct) {
            return res.status(400).json({ message: 'You are already monitoring this URL.' });
        }

        // Scrape initial product data
        const scrapedData = await scrapeProduct(url);
        if (!scrapedData.name || !scrapedData.price) {
            return res.status(500).json({ message: 'Failed to scrape initial product data (name or price).' });
        }

        // Create new product entry in DB
        const product = new Product({
            userId,
            url,
            name: scrapedData.name,
            imageUrl: scrapedData.imageUrl,
            initialPrice: scrapedData.price,
            currentPrice: scrapedData.price, // Set current price to initial scraped price
            targetPrice
        });

        await product.save(); // Save the new product

        res.status(201).json({
            message: 'Product added successfully for monitoring.',
            product
        });

    } catch (error) {
        console.error('Error adding product:', error.message);
        // If scraping failed, return specific error
        if (error.message.includes('Failed to scrape essential data')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).send('Server error. Could not add product.');
    }
};

// @desc    Get all products monitored by the authenticated user
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).send('Server error. Could not retrieve products.');
    }
};

// @desc    Update a product (e.g., target price, status)
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res) => {
    const { id } = req.params; // Product ID from URL
    const userId = req.user.id; // User ID from authenticated request
    const { targetPrice, status } = req.body;

    try {
        const product = await Product.findOne({ _id: id, userId });

        if (!product) {
            return res.status(404).json({ message: 'Product not found or you are not authorized to update it.' });
        }

        // Update fields if provided
        if (targetPrice !== undefined) product.targetPrice = targetPrice;
        if (status !== undefined) product.status = status;

        await product.save();

        res.status(200).json({
            message: 'Product updated successfully.',
            product
        });

    } catch (error) {
        console.error('Error updating product:', error.message);
        res.status(500).send('Server error. Could not update product.');
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
    const { id } = req.params; // Product ID from URL
    const userId = req.user.id; // User ID from authenticated request

    try {
        const product = await Product.findOneAndDelete({ _id: id, userId }); // Find and delete by product ID and user ID

        if (!product) {
            return res.status(404).json({ message: 'Product not found or you are not authorized to delete it.' });
        }

        res.status(200).json({ message: 'Product deleted successfully.' });

    } catch (error) {
        console.error('Error deleting product:', error.message);
        res.status(500).send('Server error. Could not delete product.');
    }
};