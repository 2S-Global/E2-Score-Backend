import OnlineProfile from "../../models/OnlineProfile.js";

/**
 * @description Add a new online profile for the authenticated user
 * @route POST /api/candidate/accomplishments/add_online_profile
 * @security BearerAuth
 * @param {object} req.body - Online profile details to add
 * @param {string} req.body.socialProfile.required - Social profile name
 * @param {string} req.body.url.required - URL of the social profile
 * @param {string} [req.body.description] - Optional description of the social profile
 * @returns {object} 201 - Online profile added successfully
 * @returns {object} 400 - Required fields missing
 * @returns {object} 500 - Error adding online profile
 */

export const addOnlineProfile = async (req, res) => {
  try {
    const { socialProfile, url, description } = req.body;
    const userId = req.userId;

    if (!userId || !socialProfile || !url) {
      return res.status(400).json({
        message: "Required fields: socialProfile and url.",
      });
    }

    const newProfile = new OnlineProfile({
      userId,
      socialProfile,
      url,
      description,
    });

    await newProfile.save();

    res.status(201).json({
      success: true,
      message: "Online profile inserted successfully!",
      data: newProfile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error inserting online profile",
      error: error.message,
    });
  }
};

/**
 * @description Get the online profiles of the authenticated user
 * @route GET /api/candidate/accomplishments/get_online_profile
 * @security BearerAuth
 * @param {object} req.body - User ID
 * @returns {object} 200 - All online profiles of the user
 * @returns {object} 400 - User ID is required.
 * @returns {object} 500 - Error fetching online profiles
 */
export const getOnlineProfile = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required.",
      });
    }

    const profiles = await OnlineProfile.find({
      userId,
      isDel: false,
    }).sort({ createdAt: -1 });

    // Get unique socialProfile values
    const socialProfileIds = [
      ...new Set(
        profiles.map((p) => parseInt(p.socialProfile)).filter(Boolean)
      ),
    ];
    if (socialProfileIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: profiles,
      });
    }

    const placeholders = socialProfileIds.map(() => "?").join(",");
    const [socialRows] = await db_sql.execute(
      `SELECT id, name FROM social_profile WHERE id IN (${placeholders}) AND is_del = 0 AND is_active = 1`,
      socialProfileIds
    );

    const socialMap = {};
    socialRows.forEach((row) => {
      socialMap[row.id] = row.name;
    });

    const formattedProfiles = profiles.map((profile) => {
      return {
        ...profile._doc,
        socialProfileName: socialMap[parseInt(profile.socialProfile)] || null,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedProfiles,
    });
  } catch (error) {
    console.error("Error in getOnlineProfile:", error.message);
    res.status(500).json({
      message: "Error fetching online profile",
      error: error.message,
    });
  }
};

/**
 * @description Edit an existing online profile for the authenticated user.
 * @route PUT /api/candidate/accomplishments/edit_online_profile
 * @security BearerAuth
 * @param {object} req.body - Online profile details to edit
 * @param {string} req.body._id.required - ID of the online profile to edit
 * @param {string} req.body.socialProfile.required - Updated social profile name
 * @param {string} req.body.url.required - Updated URL of the social profile
 * @param {string} [req.body.description] - Optional updated description of the social profile
 * @returns {object} 200 - Online profile updated successfully
 * @returns {object} 400 - Required fields missing
 * @returns {object} 404 - Online profile not found or already deleted
 * @returns {object} 500 - Error updating online profile
 */
export const editOnlineProfile = async (req, res) => {
  try {
    const { _id, socialProfile, url, description } = req.body;
    const userId = req.userId;

    if (!userId || !_id || !socialProfile || !url) {
      return res.status(400).json({
        message: "Required fields: _id, socialProfile, and url edit.",
      });
    }

    const profile = await OnlineProfile.findOne({
      _id,
      userId,
      isDel: false,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Online profile not found or already deleted.",
      });
    }

    profile.socialProfile = socialProfile;
    profile.url = url;
    profile.description = description;
    profile.updatedAt = new Date();

    const updatedProfile = await profile.save();

    res.status(200).json({
      success: true,
      message: "Online profile updated successfully!",
      data: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating online profile",
      error: error.message,
    });
  }
};

// /api/candidate/accomplishments/delete_online_profile

/**
 * @description Delete an existing online profile for the authenticated user.
 * @route DELETE /api/candidate/accomplishments/delete_online_profile
 * @security BearerAuth
 * @param {object} req.body - Online profile details to delete
 * @param {string} req.body._id.required - ID of the online profile to delete
 * @returns {object} 200 - Online profile deleted successfully
 * @returns {object} 400 - Required fields missing
 * @returns {object} 404 - Online profile not found or already deleted
 * @returns {object} 500 - Error deleting online profile
 */
export const deleteOnlineProfile = async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.userId;

    if (!userId || !_id) {
      return res.status(400).json({
        message: "Required fields: _id is missing.",
      });
    }

    const profile = await OnlineProfile.findOne({
      _id,
      userId,
      isDel: false,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Online profile not found or already deleted.",
      });
    }

    profile.isDel = true;
    profile.updatedAt = new Date();

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Online profile deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting online profile",
      error: error.message,
    });
  }
};
