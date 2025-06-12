const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (Format: "Bearer TOKEN")
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user ID from token to the request object
            req.user = decoded.user; // decoded.user should contain { id: userId }

            next(); // Move to the next middleware/route handler

        } catch (error) {
            console.error('Auth middleware error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };