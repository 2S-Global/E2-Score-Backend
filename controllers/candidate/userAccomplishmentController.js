import OnlineProfile from "../../models/OnlineProfile.js";
import WorkSample from "../../models/WorkSample.js";
import UserResearch from "../../models/ResearchModel.js";
import UserPresentation from "../../models/PrensentationModel.js";
import UserPatent from "../../models/PatentModel.js";
import UserCertification from "../../models/CertificationModel.js";
import db_sql from "../../config/sqldb.js";
import list_social_profile from "../../models/monogo_query/socialProfileModel.js";

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
export const getOnlineProfileBySql = async (req, res) => {
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
        profiles.map((p) => p.socialProfile).filter(Boolean)
      ),
    ];

    if (socialProfileIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: profiles,
      });
    }

    // Fetch social profile names using Mongoose
    const socialRows = await list_social_profile.find({
      _id: { $in: socialProfileIds },
      is_del: 0,
      is_active: 1,
    })
      .select("_id name")
      .lean();

    const socialMap = {};
    socialRows.forEach((row) => {
      socialMap[row._id] = row.name;
    });

    const formattedProfiles = profiles.map((profile) => {
      return {
        ...profile._doc,
        socialProfileName: socialMap[profile.socialProfile] || null,
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

//     -------------------------Work Samples---------------------------------

/**
 * @description Add a new work sample to the authenticated user's profile.
 * @route POST /api/candidate/accomplishments/add_work_samples
 * @security BearerAuth
 * @param {object} req.body - Work sample details to add
 * @param {string} req.body.workTitle.required - Work sample title
 * @param {string} req.body.url.required - URL of the work sample
 * @param {string|number} req.body.durationFromYear.required - Year of the work sample start date
 * @param {string|number} req.body.durationFromMonth.required - Month of the work sample start date
 * @param {string|number} req.body.durationToYear.required - Year of the work sample end date
 * @param {string|number} req.body.durationToMonth.required - Month of the work sample end date
 * @param {boolean|string} req.body.currentlyWorking - Whether the work sample is currently active
 * @param {string} req.body.description - Optional description of the work sample
 * @returns {object} 200 - Work sample saved successfully
 * @returns {object} 400 - Required fields missing
 * @returns {object} 500 - Error saving work sample
 */
export const addWorkSample = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      workTitle,
      url,
      durationFromYear,
      durationFromMonth,
      durationToYear,
      durationToMonth,
      currentlyWorking,
      description,
    } = req.body;

    // Validate required fields
    if (typeof workTitle !== "string" || workTitle.trim() === "") {
      return res.status(400).json({
        message: "Field 'workTitle' is required and cannot be empty.",
      });
    }

    if (typeof url !== "string" || url.trim() === "") {
      return res.status(400).json({
        message: "Field 'url' is required and cannot be empty.",
      });
    }

    const newWorkSample = new WorkSample({
      userId,
      workTitle,
      url,
      durationFrom: {
        year: durationFromYear ? parseInt(durationFromYear) : null,
        month: durationFromMonth ? parseInt(durationFromMonth) : null,
      },
      durationTo: {
        year: durationToYear ? parseInt(durationToYear) : null,
        month: durationToMonth ? parseInt(durationToMonth) : null,
      },
      currentlyWorking,
      description,
    });

    await newWorkSample.save();

    res.status(200).json({
      message: "Work sample saved successfully",
      data: newWorkSample,
      success: true,
    });
  } catch (error) {
    console.error("Error saving work sample:", error.message);
    res.status(500).json({
      message: "Error saving work sample",
      error: error.message,
    });
  }
};

/**
 * @description Get all work samples from the database
 * @route GET /api/candidate/accomplishments/get_work_samples
 * @success {object} 200 - All work samples
 * @error {object} 500 - Database query failed
 */
export const getWorkSamples = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required.",
      });
    }

    const workSamples = await WorkSample.find({
      userId,
      isDel: false,
    }).sort({ createdAt: -1 });

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const formattedSamples = workSamples.map((sample) => {
      return {
        ...sample._doc,
        durationFrom: {
          year: sample.durationFrom.year,
          month: monthNames[sample.durationFrom.month - 1],
          month_id: sample.durationFrom.month,
        },
        durationTo: {
          year: sample.durationTo.year,
          month: monthNames[sample.durationTo.month - 1],
          month_id: sample.durationTo.month,
        },
      };
    });

    res.status(200).json({
      success: true,
      data: formattedSamples,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error Fetching work samples",
      error: error.message,
    });
  }
};

/**
 * @description Edit an existing work sample for the authenticated user.
 * @route PUT /api/candidate/accomplishments/edit_work_samples
 * @security BearerAuth
 * @param {object} req.body - Work sample details to edit
 * @param {string} req.body._id.required - ID of the work sample to edit
 * @param {string} [req.body.workTitle] - Updated work sample title
 * @param {string} [req.body.url] - Updated URL of the work sample
 * @param {string} [req.body.description] - Updated description of the work sample
 * @param {boolean} [req.body.currentlyWorking] - Updated currently working status
 * @param {number} [req.body.durationFromYear] - Updated year of the work sample start date
 * @param {number} [req.body.durationFromMonth] - Updated month of the work sample start date
 * @param {number} [req.body.durationToYear] - Updated year of the work sample end date
 * @param {number} [req.body.durationToMonth] - Updated month of the work sample end date
 * @returns {object} 200 - Work sample updated successfully
 * @returns {object} 400 - Required fields missing
 * @returns {object} 404 - Work sample not found or already deleted
 * @returns {object} 500 - Error updating work sample
 */
export const editWorkSample = async (req, res) => {
  try {
    const {
      _id,
      workTitle,
      url,
      description,
      durationFromYear,
      durationFromMonth,
      durationToYear,
      durationToMonth,
      currentlyWorking,
    } = req.body;

    const userId = req.userId;

    // Required fields check
    if (!userId || !_id) {
      return res.status(400).json({
        message: "Required fields: _id is missing.",
      });
    }

    if (typeof workTitle !== "string" || workTitle.trim() === "") {
      return res.status(400).json({
        message: "Field 'workTitle' is required and cannot be empty.",
      });
    }

    if (typeof url !== "string" || url.trim() === "") {
      return res.status(400).json({
        message: "Field 'url' is required and cannot be empty.",
      });
    }

    // Find the existing document
    const workSample = await WorkSample.findOne({
      _id,
      userId,
      isDel: false,
    });

    if (!workSample) {
      return res.status(404).json({
        success: false,
        message: "Work sample not found or already deleted.",
      });
    }

    // Update only the fields provided in the request

    workSample.workTitle = workTitle.trim();
    workSample.url = url.trim();
    workSample.description = description.trim();

    if (currentlyWorking === "true") {
      workSample.currentlyWorking = true;
    } else if (currentlyWorking === "false") {
      workSample.currentlyWorking = false;
    }

    workSample.durationFrom = {
      year: durationFromYear
        ? parseInt(durationFromYear)
        : workSample.durationFrom?.year,
      month: durationFromMonth
        ? parseInt(durationFromMonth)
        : workSample.durationFrom?.month,
    };

    workSample.durationTo = {
      year: durationToYear
        ? parseInt(durationToYear)
        : workSample.durationTo?.year,
      month: durationToMonth
        ? parseInt(durationToMonth)
        : workSample.durationTo?.month,
    };

    workSample.updatedAt = new Date();

    const updatedWorkSample = await workSample.save();

    res.status(200).json({
      success: true,
      message: "Work sample updated successfully!",
      data: updatedWorkSample,
    });
  } catch (error) {
    console.error("Error updating work sample:", error.message);
    res.status(500).json({
      message: "Error updating work sample",
      error: error.message,
    });
  }
};

/**
 * @description Delete an existing work sample for the authenticated user.
 * @route DELETE /api/candidate/accomplishments/delete_work_sample
 * @security BearerAuth
 * @param {object} req.body - Work sample to delete
 * @param {string} req.body._id.required - ID of the work sample to delete
 * @returns {object} 200 - Work sample deleted successfully
 * @returns {object} 400 - Required fields missing
 * @returns {object} 404 - Work sample not found or already deleted
 * @returns {object} 500 - Error deleting work sample
 */
export const deleteWorkSample = async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.userId;

    if (!userId || !_id) {
      return res.status(400).json({
        message: "Required fields: _id is missing.",
      });
    }

    const workSample = await WorkSample.findOne({
      _id,
      userId,
      isDel: false,
    });

    if (!workSample) {
      return res.status(404).json({
        success: false,
        message: "Work sample not found or already deleted.",
      });
    }

    workSample.isDel = true;
    workSample.updatedAt = new Date();

    await workSample.save();

    res.status(200).json({
      success: true,
      message: "Work sample deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting work sample",
      error: error.message,
    });
  }
};

// -----------------------------Research Publications----------------------------------------

/**
 * @description Add a new research publication for the authenticated user.
 * @route POST /api/candidate/accomplishments/add_research_publication
 * @param {object} req.body - Research publication details to add
 * @param {string} req.body.title - Title of the research publication
 * @param {string} req.body.url - URL of the research publication
 * @param {number} req.body.publishYear - Year of publication
 * @param {number} req.body.publishMonth - Month of publication
 * @param {string} [req.body.description] - Optional description of the research publication
 * @returns {object} 200 - Research publication saved successfully
 * @returns {object} 500 - Error saving research publication
 */
export const addResearchPublication = async (req, res) => {
  try {
    const { title, url, publishYear, publishMonth, description } = req.body;

    const userId = req.userId;

    //Validate required fields
    if (
      !userId ||
      typeof title !== "string" ||
      title.trim() === "" ||
      typeof url !== "string" ||
      url.trim() === ""
    ) {
      return res.status(400).json({
        message: "Required fields: title and url must be non-empty strings.",
      });
    }

    const newResearchModel = new UserResearch({
      userId,
      title: title.trim(),
      url: url.trim(),
      publishedOn: {
        year: parseInt(publishYear),
        month: parseInt(publishMonth),
      },
      description,
    });

    await newResearchModel.save();

    res.status(200).json({
      message: "Research Publication saved successfully",
      data: newResearchModel,
      success: true,
    });
  } catch (error) {
    console.error("Error saving Research Publication:", error.message);
    res.status(500).json({
      message: "Error saving Research Publication",
      error: error.message,
    });
  }
};

/**
 * @description Fetch all research publications for the authenticated user.
 * @route GET /api/candidate/accomplishments/get_research_publication
 * @returns {object} 200 - Research publications found
 * @returns {object} 400 - User ID is required
 * @returns {object} 404 - Research Publication not found or already deleted
 * @returns {object} 500 - Error fetching Research Publication
 */
export const getResearchPublication = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required.",
      });
    }

    const userResearch = await UserResearch.find({
      userId,
      isDel: false,
    }).sort({ createdAt: -1 });

    if (!userResearch) {
      return res.status(404).json({
        success: false,
        message: "Research Publication not found or already deleted.",
      });
    }

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const formattedSamples = userResearch.map((sample) => {
      return {
        ...sample._doc,
        publishedOn: {
          year: sample.publishedOn.year,
          month: monthNames[sample.publishedOn.month - 1],
          month_id: sample.publishedOn.month,
        },
      };
    });

    res.status(200).json({
      success: true,
      data: formattedSamples,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error Fetching Research Publication",
      error: error.message,
    });
  }
};

/**
 * @description Update an existing research publication for the authenticated user.
 * @route PUT /api/candidate/accomplishments/update_research_publication
 * @param {object} req.body - Research publication details to update
 * @param {string} req.body._id.required - ID of the research publication to update
 * @param {string} [req.body.title] - Updated title of the research publication
 * @param {string} [req.body.url] - Updated URL of the research publication
 * @param {number} [req.body.publishYear] - Updated year of publication
 * @param {number} [req.body.publishMonth] - Updated month of publication
 * @param {string} [req.body.description] - Optional updated description of the research publication
 * @returns {object} 200 - Research publication updated successfully
 * @returns {object} 400 - Required fields missing
 * @returns {object} 404 - Research publication not found or already deleted
 * @returns {object} 500 - Error updating research publication
 */
export const updateResearchPublication = async (req, res) => {
  try {
    const { _id, title, url, publishYear, publishMonth, description } =
      req.body;

    const userId = req.userId;

    // Required fields check
    if (!userId || !_id) {
      return res.status(400).json({
        message: "Required fields: _id is missing.",
      });
    }

    // Find the existing document
    const userResearch = await UserResearch.findOne({
      _id,
      userId,
      isDel: false,
    });

    if (!userResearch) {
      return res.status(404).json({
        success: false,
        message: "Research Publication not found or already deleted.",
      });
    }

    // Update only the fields provided in the request
    userResearch.title = title;
    userResearch.url = url;
    userResearch.publishedOn = {
      year: parseInt(publishYear),
      month: parseInt(publishMonth),
    };
    userResearch.description = description;
    userResearch.updatedAt = new Date();

    const updatedUserResearch = await userResearch.save();
    res.status(200).json({
      success: true,
      message: "Research Publication updated successfully!",
      data: updatedUserResearch,
    });
  } catch (error) {
    console.error("Error updating Research Publication:", error.message);
    res.status(500).json({
      message: "Error updating Research Publication",
      error: error.message,
    });
  }
};

/**
 * @description Soft delete a research publication by user ID and research publication ID
 * @route DELETE /api/candidate/accomplishments/delete_research_publication
 * @access protected
 * @param {string} _id.required - Research publication ID (required)
 * @returns {object} 200 - Research publication deleted successfully
 * @returns {object} 400 - Missing _id in body
 * @returns {object} 404 - Research publication not found or already deleted
 * @returns {object} 500 - Server error
 */
export const deleteResearchPublication = async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.userId;

    if (!userId || !_id) {
      return res.status(400).json({
        message: "Required fields: _id is missing.",
      });
    }

    const userResearch = await UserResearch.findOne({
      _id,
      userId,
      isDel: false,
    });

    if (!userResearch) {
      return res.status(404).json({
        success: false,
        message: "Research Publication not found or already deleted.",
      });
    }

    userResearch.isDel = true;
    userResearch.updatedAt = new Date();

    await userResearch.save();

    res.status(200).json({
      success: true,
      message: "Research Publication deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting Research Publication",
      error: error.message,
    });
  }
};
// -----------------------------Presentations----------------------------------------
/**
 * @description Add a new presentation for the authenticated user.
 * @route POST /api/candidate/accomplishments/add_presentaion
 * @security BearerAuth
 * @param {object} req.body - Presentation details to add
 * @param {string} req.body.title.required - Presentation title
 * @param {string} req.body.url.required - URL of the presentation
 * @param {string} req.body.description - Optional description of the presentation
 * @returns {object} 201 - Presentation added successfully
 * @returns {object} 400 - Required fields missing
 * @returns {object} 500 - Error adding Presentation
 */
export const addpresentaion = async (req, res) => {
  try {
    const { title, url, description } = req.body;
    const userId = req.userId;
    if (!userId || !title || !url) {
      return res.status(400).json({
        message: "Required fields: title and url.",
      });
    }
    const newpresentation = new UserPresentation({
      userId,
      title,
      url,
      description,
    });
    await newpresentation.save();
    res.status(201).json({
      success: true,
      message: "New Presentation added successfully!",
      data: newpresentation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error inserting Presentation",
      error: error.message,
    });
  }
};

/**
 * @description Update an existing presentation by ID
 * @route PUT /api/candidate/accomplishments/update_presentaion
 * @access protected
 * @param {string} _id.required - Presentation ID (required)
 * @param {string} title - Presentation title
 * @param {string} url - URL of the presentation
 * @param {string} description - Optional description of the presentation
 * @returns {object} 200 - Presentation updated successfully
 * @returns {object} 400 - Required fields missing
 * @returns {object} 404 - Presentation not found or already deleted
 * @returns {object} 500 - Server error
 */
export const updatepresentaion = async (req, res) => {
  try {
    const { _id, title, url, description } = req.body;
    const userId = req.userId;
    // Required fields check
    if (!userId || !_id) {
      return res.status(400).json({
        message: "Required fields: _id is missing.",
      });
    }
    // Find the existing document
    const userPresentation = await UserPresentation.findOne({
      _id,
      userId,
      isDel: false,
    });

    if (!userPresentation) {
      return res.status(404).json({
        success: false,
        message: "Presentation not found or already deleted.",
      });
    }

    userPresentation.title = title;
    userPresentation.url = url;
    userPresentation.description = description;
    await userPresentation.save();
    res.status(200).json({
      success: true,
      message: "Presentation updated successfully!",
      data: userPresentation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating Presentation",
      error: error.message,
    });
  }
};

/**
 * @description Soft delete a presentation by user ID and presentation ID
 * @route DELETE /api/candidate/accomplishments/delete_presentaion
 * @access protected
 * @param {string} _id.required - Presentation ID (required)
 * @returns {object} 200 - Presentation deleted successfully
 * @returns {object} 400 - Missing _id in body
 * @returns {object} 404 - Presentation not found or already deleted
 * @returns {object} 500 - Server error
 */
export const deletepresentaion = async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.userId;
    // Required fields check
    if (!userId || !_id) {
      return res.status(400).json({
        message: "Required fields: _id is missing.",
      });
    }
    // Find the existing document
    const userPresentation = await UserPresentation.findOne({
      _id,
      userId,
      isDel: false,
    });

    if (!userPresentation) {
      return res.status(404).json({
        success: false,
        message: "Presentation not found or already deleted.",
      });
    }

    userPresentation.isDel = true;

    await userPresentation.save();
    res.status(200).json({
      success: true,
      message: "Presentation deleted successfully!",
      data: userPresentation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting Presentation",
      error: error.message,
    });
  }
};

/**
 * @function getpresetation
 * @route GET /api/candidate/accomplishments/get_presentaion
 * @description Fetch all Presentations for a given user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise}
 *  @access protected
 */
export const getpresetation = async (req, res) => {
  try {
    const userId = req.userId;
    const presentations = await UserPresentation.find({ userId, isDel: false });
    res.status(200).json({
      success: true,
      message: "Presentations fetched successfully!",
      data: presentations,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching Presentations",
      error: error.message,
    });
  }
};

// -----------------------------Patents----------------------------------------

/**
 * @description Add a new patent for the authenticated user.
 * @route POST /api/candidate/accomplishments/add_patent
 * @param {object} req.body - Patent details to add
 * @param {string} req.body.title.required - Title of the patent
 * @param {string} req.body.url.required - URL of the patent
 * @param {string} req.body.patent_office - Patent office name
 * @param {string} req.body.status - Status of the patent
 * @param {string} req.body.application_number - Application number of the patent
 * @param {string|number} req.body.issue_year - Year the patent was issued
 * @param {string|number} req.body.issue_month - Month the patent was issued
 * @param {string} [req.body.description] - Optional description of the patent
 * @returns {object} 200 - Patent added successfully
 * @returns {object} 400 - Required fields missing
 * @returns {object} 500 - Error adding patent
 */
export const addpatent = async (req, res) => {
  try {
    const {
      title,
      url,
      patent_office,
      status,
      application_number,
      issue_year,
      issue_month,
      description,
    } = req.body;
    const userId = req.userId;

    if (!userId || !title || !url) {
      return res.status(400).json({
        message: "Required fields: title and url.",
      });
    }

    const newPatent = new UserPatent({
      userId,
      title,
      url,
      patent_office,
      status,
      application_number,
      issue_year,
      issue_month,
      description,
    });
    await newPatent.save();
    res.status(200).json({
      success: true,
      message: "Patent added successfully!",
      data: newPatent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding Patent",
      error: error.message,
    });
  }
};

/**
 * @description Soft delete a patent by user ID and patent ID
 * @route DELETE /api/candidate/accomplishments/delete_patent
 * @access protected
 * @param {string} _id.required - Patent ID (required)
 * @returns {object} 200 - Patent deleted successfully
 * @returns {object} 400 - Missing _id in body
 * @returns {object} 404 - Patent not found or already deleted
 * @returns {object} 500 - Server error
 */
export const deletepatent = async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.userId;
    // Required fields check
    if (!userId || !_id) {
      return res.status(400).json({
        message: "Required fields: _id is missing.",
      });
    }
    // Find the existing document
    const userPatent = await UserPatent.findOne({
      _id,
      userId,
      isDel: false,
    });

    if (!userPatent) {
      return res.status(404).json({
        success: false,
        message: "Patent not found or already deleted.",
      });
    }

    userPatent.isDel = true;

    await userPatent.save();
    res.status(200).json({
      success: true,
      message: "Patent deleted successfully!",
      data: userPatent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting Patent",
      error: error.message,
    });
  }
};

/**
 * @description Update an existing patent for the authenticated user by ID.
 * @route PUT /api/candidate/accomplishments/update_patent
 * @param {object} req.body - Patent details to update
 * @param {string} req.body._id.required - ID of the patent to update
 * @param {string} [req.body.title] - Updated title of the patent
 * @param {string} [req.body.url] - Updated URL of the patent
 * @param {string} [req.body.patent_office] - Updated patent office name
 * @param {string} [req.body.status] - Updated status of the patent
 * @param {string} [req.body.application_number] - Updated application number of the patent
 * @param {string|number} [req.body.issue_year] - Updated year the patent was issued
 * @param {string|number} [req.body.issue_month] - Updated month the patent was issued
 * @param {string} [req.body.description] - Optional updated description of the patent
 * @returns {object} 200 - Patent updated successfully
 * @returns {object} 400 - Required fields missing
 * @returns {object} 404 - Patent not found or already deleted
 * @returns {object} 500 - Error updating patent
 */
export const updatepatent = async (req, res) => {
  try {
    const {
      _id,
      title,
      url,
      patent_office,
      status,
      application_number,
      issue_year,
      issue_month,
      description,
    } = req.body;
    const userId = req.userId;

    // Required fields check
    if (!userId || !_id) {
      return res.status(400).json({
        message: "Required fields: _id is missing.",
      });
    }

    // Find the existing document
    const userPatent = await UserPatent.findOne({
      _id,
      userId,
      isDel: false,
    });

    if (!userPatent) {
      return res.status(404).json({
        success: false,
        message: "Patent not found or already deleted.",
      });
    }

    userPatent.title = title;
    userPatent.url = url;
    userPatent.patent_office = patent_office;
    userPatent.status = status;
    userPatent.application_number = application_number;
    userPatent.issue_year = issue_year;
    userPatent.issue_month = issue_month;
    userPatent.description = description;

    await userPatent.save();
    res.status(200).json({
      success: true,
      message: "Patent updated successfully!",
      data: userPatent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating Patent",
      error: error.message,
    });
  }
};

/**
 * @description List all patents for the authenticated user.
 * @route GET /api/candidate/accomplishments/list_patent
 * @access protected
 * @returns {object} 200 - List of user's patents
 * @returns {object} 500 - Error listing patents
 */
export const listpatent = async (req, res) => {
  try {
    const userId = req.userId;
    const patents = await UserPatent.find({ userId, isDel: false });
    res.status(200).json({
      success: true,
      data: patents,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error listing Patent",
      error: error.message,
    });
  }
};

// -----------------------------Certificates----------------------------------------

/**
 * @description Add a new certificate to the authenticated user's profile.
 * @route POST /api/candidate/accomplishments/add_certificate
 * @security BearerAuth
 * @param {object} req.body - Certificate details to add
 * @param {string} req.body.title.required - Title of the certificate
 * @param {string} req.body.certificationId.required - Unique ID of the certificate
 * @param {string} req.body.url.required - URL of the certificate
 * @param {string|number} req.body.validityFromyear.required - Year of the start date
 * @param {string|number} req.body.validityFrommonth.required - Month of the start date
 * @param {string|number} req.body.validityToyear.required - Year of the end date
 * @param {string|number} req.body.validityToMonth.required - Month of the end date
 * @param {boolean} req.body.doesNotExpire.required - Whether the certificate does not expire
 * @returns {object} 200 - Certificate saved successfully
 * @returns {object} 400 - Required fields missing
 * @returns {object} 404 - Certificate with the same ID already exists
 * @returns {object} 500 - Error adding Certificate
 */
export const addcertificate = async (req, res) => {
  try {
    const {
      title,
      certificationId,
      url,
      validityFromyear,
      validityFrommonth,
      validityToyear,
      validityToMonth,
      doesNotExpire,
    } = req.body;

    const userId = req.userId;

    const newCertificate = new UserCertification({
      userId,
      title,
      certificationId,
      url,
      validityFromyear,
      validityFrommonth,
      validityToyear,
      validityToMonth,
      doesNotExpire,
    });

    await newCertificate.save();
    res.status(200).json({
      success: true,
      message: "Certificate added successfully!",
      data: newCertificate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error adding Certificate",
      //  error: error.message,
    });
  }
};

/**
 * @description Get all certificates for the authenticated user.
 * @route GET /api/candidate/accomplishments/list_certificate
 * @access protected
 * @returns {object} 200 - List of certificates
 * @returns {object} 500 - Error listing certificates
 */
export const list_certificate = async (req, res) => {
  try {
    const userId = req.userId;
    const certificates = await UserCertification.find({ userId, isDel: false });
    res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error listing Certificate",
      error: error.message,
    });
  }
};

/**
 * @description Update an existing certificate for the authenticated user.
 * @route PUT /api/candidate/accomplishments/update_certificate
 * @param {object} req.body - Certificate details to update
 * @param {string} req.body._id.required - ID of the certificate to update
 * @param {string} [req.body.title] - Updated title of the certificate
 * @param {string} [req.body.certificationId] - Updated certification ID of the certificate
 * @param {string} [req.body.url] - Updated URL of the certificate
 * @param {string|number} [req.body.validityFromyear] - Updated year from which the certificate is valid
 * @param {string|number} [req.body.validityFrommonth] - Updated month from which the certificate is valid
 * @param {string|number} [req.body.validityToyear] - Updated year until which the certificate is valid
 * @param {string|number} [req.body.validityTomonth] - Updated month until which the certificate is valid
 * @param {boolean} [req.body.doesNotExpire] - Updated whether the certificate does not expire
 * @returns {object} 200 - Certificate updated successfully
 * @returns {object} 400 - Required fields missing
 * @returns {object} 404 - Certificate not found or already deleted
 * @returns {object} 500 - Error updating certificate
 */
export const updatecertificate = async (req, res) => {
  try {
    const {
      _id,
      title,
      certificationId,
      url,
      validityFromyear,
      validityFrommonth,
      validityToyear,
      validityToMonth,
      doesNotExpire,
    } = req.body;

    const userId = req.userId;

    // Required fields check
    if (!userId || !_id) {
      return res.status(400).json({
        message: "Required fields: _id is missing.",
      });
    }

    // Find the existing document
    const userCertificate = await UserCertification.findOne({
      _id,
      userId,
      isDel: false,
    });

    if (!userCertificate) {
      return res.status(404).json({
        message: "Certificate not found.",
      });
    }

    // Update the document
    userCertificate.title = title;
    userCertificate.certificationId = certificationId;
    userCertificate.url = url;
    userCertificate.validityFromyear = validityFromyear;
    userCertificate.validityFrommonth = validityFrommonth;
    userCertificate.validityToyear = validityToyear;
    /* validityToMonth */
    userCertificate.validityToMonth = validityToMonth;
    userCertificate.doesNotExpire = doesNotExpire;

    await userCertificate.save();

    res.status(200).json({
      success: true,
      message: "Certificate updated successfully!",
      data: userCertificate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating Certificate",
      error: error.message,
    });
  }
};

/**
 * @description Delete an existing certificate from the authenticated user's profile.
 * @route DELETE /api/candidate/accomplishments/delete_certificate
 * @security BearerAuth
 * @param {object} req.body - Certificate details to delete
 * @param {string} req.body._id.required - ID of the certificate to delete
 * @returns {object} 200 - Certificate deleted successfully
 * @returns {object} 400 - Required fields missing
 * @returns {object} 404 - Certificate not found or already deleted
 * @returns {object} 500 - Error deleting Certificate
 */
export const deleteCertificate = async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.userId;

    // Find the existing document
    const userCertificate = await UserCertification.findOne({
      _id,
      userId,
      isDel: false,
    });

    if (!userCertificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found or already deleted.",
      });
    }

    // Soft delete: mark as deleted
    userCertificate.isDel = true;
    await userCertificate.save();

    res.status(200).json({
      success: true,
      message: "Certificate deleted successfully!",
      data: userCertificate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting Certificate",
      error: error.message,
    });
  }
};
