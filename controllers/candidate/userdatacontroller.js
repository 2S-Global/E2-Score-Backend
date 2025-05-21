import User from "../../models/userModel.js";

/**
 * @description Get the user by user_id
 * @route GET /candidate/userdata
 * @access protected
 */

export const getUser = async (req, res) => {
  try {
    const user_id = req.userId;
    const user = await User.findById(user_id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
