const adminMiddleware = (req, res, next) => {
  try {
    // user attach hona chahiye (authMiddleware ke baad)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    const role = req.user.role;

    // sirf ADMIN ya SUB_ADMIN allow
    if (role !== "ADMIN" && role !== "SUB_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error in admin middleware",
    });
  }
};

module.exports = adminMiddleware;
