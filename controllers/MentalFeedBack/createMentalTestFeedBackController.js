import mongoose from "mongoose";
import AttemptedMentalTestFeedbackModel from "../../models/AttemptedMentalTestFeedbackModel.js";
import MentalTestFeedBackModel from "../../models/MentalTestFeedBackModel.js";
import { apiResponse } from "../../utility/apiResponse.js";
import MentalTestHeaderModel from "../../models/MentalTestHeaderModel.js";

export const createMentalTestFeedBackController = async (req, res) => {
  try {
    const { header, questions } = req.body;

    // Validate header
    if (!header || !mongoose.Types.ObjectId.isValid(header)) {
      return apiResponse(
        res,
        400,
        false,
        "Valid Header ID is required",
        null,
        null,
      );
    }

    // Validate questions array
    if (!Array.isArray(questions) || questions.length === 0) {
      return apiResponse(
        res,
        400,
        false,
        "Questions array is required",
        null,
        null,
      );
    }

    // Validate each question
    const invalidQuestion = questions.some(
      (question) =>
        !question ||
        typeof question !== "object" ||
        typeof question.text !== "string" ||
        !question.text.trim() ||
        typeof question.is_reversed !== "boolean",
    );

    if (invalidQuestion) {
      return apiResponse(
        res,
        400,
        false,
        "Each question must contain valid text and is_reversed",
        null,
        null,
      );
    }

    // Check if feedback already exists for this header
    const existingFeedback = await MentalTestFeedBackModel.findOne({
      header,
      is_del: false,
    });

    if (existingFeedback) {
      return apiResponse(
        res,
        400,
        false,
        "Feedback questions already exist for this header",
        null,
        null,
      );
    }

    // Clean question text and remove duplicate questions
    const uniqueQuestions = new Map();

    questions.forEach((question) => {
      const text = question.text.trim();

      if (!uniqueQuestions.has(text)) {
        uniqueQuestions.set(text, {
          text,
          is_reversed: question.is_reversed,
        });
      }
    });

    const cleanedQuestions = Array.from(uniqueQuestions.values());

    // Create one document for one header
    const response = await MentalTestFeedBackModel.create({
      header,
      questions: cleanedQuestions,
    });

    return apiResponse(
      res,
      201,
      true,
      "Feedback questions created successfully",
      response,
      null,
    );
  } catch (error) {
    console.error("Create Mental Test Feedback Error:", error);

    return apiResponse(res, 500, false, "Internal Server Error", null, error);
  }
};

export const submitMentalTestFeedBackController = async (req, res) => {
  const userId = req.userId;

  try {
    const feedbacks = req.body;

    // Check array
    if (!Array.isArray(feedbacks) || feedbacks.length === 0) {
      return apiResponse(
        res,
        400,
        false,
        "Feedback data is required",
        null,
        null,
      );
    }

    const userAlreadyGivenFeedback =
      await AttemptedMentalTestFeedbackModel.findOne({ user: userId });
    if (userAlreadyGivenFeedback) {
      return apiResponse(
        res,
        400,
        false,
        "You have already submitted the feedback",
        null,
        null,
      );
    }

    // Validate every feedback
    for (const feedback of feedbacks) {
      const { questionId, remarks } = feedback;

      if (!questionId) {
        return apiResponse(
          res,
          400,
          false,
          "Question Id is required",
          null,
          null,
        );
      }

      if (remarks == null || remarks < 1 || remarks > 5) {
        return apiResponse(
          res,
          400,
          false,
          "Remarks must be in between 1 to 5",
          null,
          null,
        );
      }
    }

    // Prepare data
    const data = feedbacks.map((feedback) => ({
      user: userId,
      questionId: feedback.questionId,
      remarks: feedback.remarks,
    }));

    // Insert multiple documents
    const response = await AttemptedMentalTestFeedbackModel.insertMany(data);

    if (!response) {
      return apiResponse(
        res,
        400,
        false,
        "Failed to submit feedback",
        null,
        null,
      );
    }

    return apiResponse(
      res,
      200,
      true,
      "Feedback submitted successfully",
      response,
      null,
    );
  } catch (error) {
    console.log(error);

    return apiResponse(res, 500, false, "Internal Server Error", null, error);
  }
};

export const getAllFeedBackForm = async (req, res) => {
  try {
    const feedback = await MentalTestFeedBackModel.find({
      is_del: false,
    }).sort({ createdAt: -1 });
    if (!feedback) {
      return apiResponse(res, 400, false, "Failed to get feedback", null, null);
    }
    return apiResponse(
      res,
      200,
      true,
      "Feedback fetched successfully",
      feedback,
      null,
    );
  } catch (error) {
    return apiResponse(
      res,
      500,
      false,
      "Internal Server Error",
      null,
      error.message,
    );
  }
};

export const getAllMentalTestHeader = async (req, res) => {
  try {
    const mentalTestHeader =
      await MentalTestHeaderModel.find().select("header");
    if (!mentalTestHeader) {
      return apiResponse(
        res,
        400,
        false,
        "Failed to get mental test header",
        null,
        null,
      );
    }
    return apiResponse(
      res,
      200,
      true,
      "Mental test header fetched successfully",
      mentalTestHeader,
      null,
    );
  } catch (error) {
    return apiResponse(
      res,
      500,
      false,
      "Internal Server Error",
      null,
      error.message,
    );
  }
};

export const updateMentalTestFeedBackController = async (req, res) => {
  const { id } = req.params;
  const { header, questions } = req.body;

  // Validate feedback ID
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return apiResponse(
      res,
      400,
      false,
      "Valid Feedback ID is required",
      null,
      null,
    );
  }

  // Validate header if provided
  if (
    header !== undefined &&
    (!header || !mongoose.Types.ObjectId.isValid(header))
  ) {
    return apiResponse(
      res,
      400,
      false,
      "Valid Header ID is required",
      null,
      null,
    );
  }

  // Validate questions array if provided
  if (questions !== undefined) {
    if (!Array.isArray(questions) || questions.length === 0) {
      return apiResponse(
        res,
        400,
        false,
        "Questions array must be a non-empty array",
        null,
        null,
      );
    }

    for (const question of questions) {
      if (!question || typeof question !== "object") {
        return apiResponse(
          res,
          400,
          false,
          "Each question item must be an object",
          null,
          null,
        );
      }

      if (question._id) {
        if (!mongoose.Types.ObjectId.isValid(question._id)) {
          return apiResponse(
            res,
            400,
            false,
            "Invalid question _id format",
            null,
            null,
          );
        }
        if (
          question.text !== undefined &&
          (typeof question.text !== "string" || !question.text.trim())
        ) {
          return apiResponse(
            res,
            400,
            false,
            "Question text must be a non-empty string",
            null,
            null,
          );
        }
        if (
          question.is_reversed !== undefined &&
          typeof question.is_reversed !== "boolean"
        ) {
          return apiResponse(
            res,
            400,
            false,
            "Question is_reversed must be a boolean",
            null,
            null,
          );
        }
      } else {
        if (typeof question.text !== "string" || !question.text.trim()) {
          return apiResponse(
            res,
            400,
            false,
            "New question must have a non-empty text string",
            null,
            null,
          );
        }
        if (
          question.is_reversed !== undefined &&
          typeof question.is_reversed !== "boolean"
        ) {
          return apiResponse(
            res,
            400,
            false,
            "Question is_reversed must be a boolean",
            null,
            null,
          );
        }
      }
    }
  }

  try {
    // Check if feedback question exists
    const existingFeedback = await MentalTestFeedBackModel.findById(id);

    if (!existingFeedback) {
      return apiResponse(
        res,
        404,
        false,
        "Feedback question not found",
        null,
        null,
      );
    }

    const targetHeader =
      header !== undefined ? header : existingFeedback.header;

    // Check if header is being updated and if the new header already has feedback
    if (
      header !== undefined &&
      header.toString() !== existingFeedback.header.toString()
    ) {
      const duplicateFeedback = await MentalTestFeedBackModel.findOne({
        header: targetHeader,
        is_del: false,
        _id: { $ne: id },
      });

      if (duplicateFeedback) {
        return apiResponse(
          res,
          400,
          false,
          "Feedback questions already exist for this header",
          null,
          null,
        );
      }
    }

    if (header !== undefined) {
      existingFeedback.header = targetHeader;
    }

    if (questions !== undefined) {
      const currentQuestions = existingFeedback.questions.map((q) => ({
        _id: q._id,
        text: q.text,
        is_reversed: q.is_reversed,
      }));

      for (const incomingQ of questions) {
        if (incomingQ._id) {
          const existingIndex = currentQuestions.findIndex(
            (q) => q._id.toString() === incomingQ._id.toString(),
          );

          if (existingIndex !== -1) {
            // Patch existing question fields
            if (incomingQ.text !== undefined && incomingQ.text.trim()) {
              currentQuestions[existingIndex].text = incomingQ.text.trim();
            }
            if (incomingQ.is_reversed !== undefined) {
              currentQuestions[existingIndex].is_reversed =
                incomingQ.is_reversed;
            }
          } else {
            // If _id provided but not found, append as a new question
            currentQuestions.push({
              _id: incomingQ._id,
              text: incomingQ.text ? incomingQ.text.trim() : "",
              is_reversed:
                incomingQ.is_reversed !== undefined
                  ? incomingQ.is_reversed
                  : false,
            });
          }
        } else {
          // New question without _id
          currentQuestions.push({
            _id: new mongoose.Types.ObjectId(),
            text: incomingQ.text.trim(),
            is_reversed:
              incomingQ.is_reversed !== undefined
                ? incomingQ.is_reversed
                : false,
          });
        }
      }

      existingFeedback.questions = currentQuestions;
    }

    const updatedFeedback = await existingFeedback.save();

    return apiResponse(
      res,
      200,
      true,
      "Feedback question updated successfully",
      updatedFeedback,
      null,
    );
  } catch (error) {
    console.log(error);

    return apiResponse(res, 500, false, "Internal Server Error", null, error);
  }
};

export const deleteMentalTestFeedBackController = async (req, res) => {
  const { id } = req.params;

  // Validate feedback ID
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return apiResponse(
      res,
      400,
      false,
      "Valid Feedback ID is required",
      null,
      null,
    );
  }

  try {
    const existing = await MentalTestFeedBackModel.findById(id);
    if (!existing) {
      return apiResponse(
        res,
        404,
        false,
        "Feedback question not found",
        null,
        null,
      );
    }
    if (existing.is_del) {
      return apiResponse(
        res,
        400,
        false,
        "Feedback question is already deleted",
        null,
        null,
      );
    }

    existing.is_del = true;
    const response = await existing.save();

    return apiResponse(
      res,
      200,
      true,
      "Feedback question deleted successfully",
      response,
      null,
    );
  } catch (error) {
    return apiResponse(
      res,
      500,
      false,
      "Internal Server Error",
      null,
      error.message,
    );
  }
};

export const getMentalTestFeedbackDetailsController = async (req, res) => {
  const userId = req.userId;

  try {
    const response = await AttemptedMentalTestFeedbackModel.findOne({
      user: userId,
    })
      .populate("user", "name email phone")
      .select("-updatedAt");
    console.log("whats data coming==>", response);
    if (!response) {
      return apiResponse(res, 400, false, "No feedback found", null, null);
    }
    return apiResponse(
      res,
      200,
      true,
      "Feedback fetched successfully",
      response,
      null,
    );
  } catch (error) {
    return apiResponse(
      res,
      500,
      false,
      "Internal Server Error",
      null,
      error.message,
    );
  }
};
