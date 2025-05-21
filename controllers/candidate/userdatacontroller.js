import User from "../../models/userModel.js";
import personalDetails from "../../models/personalDetails.js";

/**
 * @function getUser
 *  @route GET /api/userdata/userdata
 * @description Get the user by user_id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise}
 *  @access protected
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

/**
 * @function getResumeHeadline
 * @description Fetch the resume headline of the authenticated user from personal details.
 * @route GET /api/userdata/resumeheadline
 * @param {Object} req - Express request object containing userId
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * @access protected
 * @throws {Error} 500 - Internal server error if fetching fails
 */

export const getResumeHeadline = async (req, res) => {
  try {
    const user_id = req.userId;
    const user = await personalDetails.findOne({ user: user_id });
    console.log(user);
    console.log(user.resumeHeadline);
    res.status(200).json(user.resumeHeadline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @description Get the Profile Summary by user_id
 * @route GET /api/userdata/profile_summary
 * @access protected
 */
export const getProfileSummary = async (req, res) => {
  try {
    const user_id = req.userId;
    const user = await personalDetails.findOne({ user: user_id });
    console.log(user);
    console.log(user.profileSummary);
    res.status(200).json(user.profileSummary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
