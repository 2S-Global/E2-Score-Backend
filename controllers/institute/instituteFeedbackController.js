import Review from "../../models/instituteFeedback.js";

// Create or Update Review
export const upsertReview = async (req, res) => {
  try {
    const institute_id = req.userId;
    const { recruiter_id, star } = req.body;

    const review = await Review.findOneAndUpdate(
      {
        institute_id,
        recruiter_id,
      },
      {
        institute_id,
        recruiter_id,
        star,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Review saved successfully",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getReviewByRecruiter = async (req, res) => {
  try {
    const institute_id = req.user._id;
    const { recruiter_id } = req.params;

    const review = await Review.findOne({
      institute_id,
      recruiter_id,
    });

    return res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
