const express = require('express');
const router = express.Router();
const { addProduct, getProducts, updateProduct, deleteProduct } = require('../controllers/productController'); // Import controller functions
const { protect } = require('../middleware/authMiddleware'); // Import the authentication middleware

// All product routes will be protected by the 'protect' middleware
router.route('/')
    .post(protect, addProduct) // Add new product
    .get(protect, getProducts); // Get all products for the user

router.route('/:id')
    .put(protect, updateProduct) // Update a specific product
    .delete(protect, deleteProduct); // Delete a specific product

module.exports = router;