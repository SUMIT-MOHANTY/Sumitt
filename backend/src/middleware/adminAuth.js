/**
 * Admin Authentication Middleware
 * Verifies if the current user has admin privileges
 */
const adminAuth = (req, res, next) => {
  try {
    // Check if user exists and has required permissions
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check admin role (adjust based on your user model structure)
    if (!user.isAdmin && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin privileges required'
      });
    }

    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

module.exports = adminAuth;
