module.exports = (req, res, next) => {
  try {
    const { roles } = req.user || {};

    if (roles && roles.includes("admin")) {
      return next();
    }

    return res.status(403).json({ message: "Admin role required" });
  } catch (error) {
    console.error("Admin check failed:", error.message);
    return res.status(500).json({ message: "Server error during role check" });
  }
};
