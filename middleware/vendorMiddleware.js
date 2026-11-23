import User from "../models/userModel.js";

const VendorMiddleware = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in to access this resource.",
      });
    }

    const user = await User.findById(req.userId)
      .select("role is_del is_active")
      .lean();
    if (!user || user.is_del || user.is_active === false) {
      return res
        .status(403)
        .json({ success: false, message: "Active vendor account required." });
    }
    if (user.role !== 4) {
      return res
        .status(403)
        .json({ success: false, message: "Only vendors can access this resource." });
    }

    return next();
  } catch (error) {
    console.error("Vendor authorization error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify vendor access.",
    });
  }
};

export default VendorMiddleware;
