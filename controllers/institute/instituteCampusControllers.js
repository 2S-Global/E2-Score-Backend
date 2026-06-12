import Campus from "../../models/instituteCampusModel.js";

// Add Campus
export const addCampus = async (req, res) => {
  try {
    const user = req.user;

    const { campus_name, campus_type, city, total_students } = req.body;

    const campus = await Campus.create({
      institute_id: user.userId, // or user._id depending on your structure
      campus_name,
      campus_type,
      city,
      total_students,
    });

    return res.status(201).json({
      success: true,
      message: "Campus added successfully",
      data: campus,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// List Campus
export const getCampuses = async (req, res) => {
  try {
    const user = req.user;

    const campuses = await Campus.find({
      institute_id: user.userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: campuses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Single Campus
export const getCampusById = async (req, res) => {
  try {
    const campus = await Campus.findById(req.params.id);

    if (!campus) {
      return res.status(404).json({
        success: false,
        message: "Campus not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: campus,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Campus
export const updateCampus = async (req, res) => {
  try {
    const campus = await Campus.findByIdAndUpdate(
      req.params.id,
      {
        campus_name: req.body.campus_name,
        campus_type: req.body.campus_type,
        city: req.body.city,
        total_students: req.body.total_students,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!campus) {
      return res.status(404).json({
        success: false,
        message: "Campus not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Campus updated successfully",
      data: campus,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Campus
export const deleteCampus = async (req, res) => {
  try {
    const campus = await Campus.findByIdAndDelete(req.params.id);

    if (!campus) {
      return res.status(404).json({
        success: false,
        message: "Campus not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Campus deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
