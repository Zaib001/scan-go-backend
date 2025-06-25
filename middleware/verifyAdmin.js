require('dotenv').config();

/**
 * Middleware to verify if the request has a valid admin API key
 * Usage: Add this to routes you want to protect
 */
const verifyAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];

  if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin access required.'
    });
  }

  next(); // Allow access
};

module.exports = { verifyAdmin };
