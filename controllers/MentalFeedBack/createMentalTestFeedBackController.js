import mongoose from "mongoose";
import AttemptedMentalTestFeedbackModel from "../../models/AttemptedMentalTestFeedbackModel.js";
import MentalTestFeedBackModel from "../../models/MentalTestFeedBackModel.js";
import { apiResponse } from "../../utility/apiResponse.js";
import MentalTestHeaderModel from "../../models/MentalTestHeaderModel.js";
import { submitMentalTestFeedbackValidation } from "../../validation/submitMentalTestFeedbackValidation.js";
import { getTraitInfo } from "../../utility/helper/mentalTestFeedbackHelper.js";
import { FULL_NAME, DESCRIPTORS } from "../../utility/helper/discConstants.js";

export const createMentalTestFeedBackController = async (req, res) => {
  try {
    const { header, questions } = req.body;

    // Validate required fields
    if (!header || !Array.isArray(questions) || questions.length === 0) {
      return apiResponse(
        res,
        400,
        false,
        "Header and questions are required",
        null,
        null,
      );
    }

    // Clean questions and remove duplicate question text in the request
    const uniqueQuestions = new Map();

    questions.forEach((question) => {
      if (!question?.text) return;

      const text = question.text.trim();

      if (!text) return;

      const key = text.toLowerCase();

      if (!uniqueQuestions.has(key)) {
        uniqueQuestions.set(key, {
          text,
          is_reversed: Boolean(question.is_reversed),
        });
      }
    });

    const cleanedQuestions = Array.from(uniqueQuestions.values());

    // Make sure valid questions remain after cleaning
    if (cleanedQuestions.length === 0) {
      return apiResponse(
        res,
        400,
        false,
        "At least one valid question is required",
        null,
        null,
      );
    }

    // Check if active feedback already exists for this header
    const existingFeedback = await MentalTestFeedBackModel.findOne({
      header,
      is_del: false,
    });

    if (existingFeedback) {
      // Append only new questions that do not already exist in the existing document
      const existingQuestions = existingFeedback.questions || [];
      const existingTexts = new Set(
        existingQuestions.map((q) => q.text.trim().toLowerCase()),
      );

      const newQuestions = cleanedQuestions.filter(
        (q) => !existingTexts.has(q.text.trim().toLowerCase()),
      );

      if (newQuestions.length > 0) {
        existingFeedback.questions.push(...newQuestions);
        const response = await existingFeedback.save();
        return apiResponse(
          res,
          200,
          true,
          "Feedback questions updated successfully",
          response,
          null,
        );
      }

      return apiResponse(
        res,
        200,
        true,
        "Questions already exist in the feedback for this header",
        existingFeedback,
        null,
      );
    }

    // Create new feedback document
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

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return apiResponse(
        res,
        409,
        false,
        "Feedback already exists for this header",
        null,
        null,
      );
    }

    return apiResponse(res, 500, false, "Internal Server Error", null, error);
  }
};

export const submitMentalTestFeedBackController = async (req, res) => {
  try {
    const userId = req.userId;

    const validation = submitMentalTestFeedbackValidation.safeParse(req.body);

    if (!validation.success) {
      return apiResponse(
        res,
        400,
        false,
        "Invalid feedback data",
        null,
        validation.error.issues[0].message,
      );
    }

    const feedbacks = validation.data;
    console.log("the Feedback ==>", feedbacks);

    const alreadySubmitted = await AttemptedMentalTestFeedbackModel.exists({
      user: userId,
    });

    if (alreadySubmitted) {
      return apiResponse(
        res,
        400,
        false,
        "You have already submitted the assessment",
        null,
        null,
      );
    }

    // Fetch active feedback templates to identify if questions are reversed and get their category/header
    const feedbackTemplates = await MentalTestFeedBackModel.find({
      is_del: false,
    }).populate("header");

    // Initialize headerScores with ALL active headers to ensure they are always returned
    const headerScores = {};
    for (const template of feedbackTemplates) {
      if (template.header) {
        const headerId = template.header._id.toString();
        const headerName = template.header.header;
        if (!headerScores[headerId]) {
          headerScores[headerId] = {
            headerId,
            headerName,
            totalScore: 0,
            questionCount: 0,
          };
        }
      }
    }

    // Map questionId -> { headerId, headerName, is_reversed }
    const questionMap = new Map();
    for (const template of feedbackTemplates) {
      if (template.header) {
        const headerId = template.header._id.toString();
        const headerName = template.header.header;
        for (const question of template.questions) {
          questionMap.set(question._id.toString(), {
            headerId,
            headerName,
            is_reversed: question.is_reversed,
          });
        }
      }
    }

    const dataToInsert = [];

    for (const feedback of feedbacks) {
      const qDetails = questionMap.get(feedback.questionId);
      if (!qDetails) {
        return apiResponse(
          res,
          400,
          false,
          `Question ID ${feedback.questionId} not found or is invalid`,
          null,
          null,
        );
      }

      const { headerId, is_reversed } = qDetails;
      const remarks = feedback.remarks;

      // score logic: is_reversed = false -> remarks, is_reversed = true -> 6 - remarks
      const score = is_reversed ? 6 - remarks : remarks;

      if (headerScores[headerId]) {
        headerScores[headerId].totalScore += score;
        headerScores[headerId].questionCount += 1;
      }

      dataToInsert.push({
        user: userId,
        questionId: feedback.questionId,
        remarks,
      });
    }

    const savedResponses =
      await AttemptedMentalTestFeedbackModel.insertMany(dataToInsert);

    // Calculate percentage, descriptor, workplaceCharacteristics, and idealFunctionalRoles for each header score
    for (const headerId in headerScores) {
      const headerObj = headerScores[headerId];
      const maxPossibleScore = headerObj.questionCount * 5;
      const percentage = maxPossibleScore > 0 ? Math.round((headerObj.totalScore / maxPossibleScore) * 100) : 0;

      const traitInfo = getTraitInfo(headerObj.headerName, percentage);

      headerObj.percentage = percentage;
      headerObj.descriptor = traitInfo.level;
      headerObj.workplaceCharacteristics = traitInfo.characteristics;
      headerObj.idealFunctionalRoles = traitInfo.idealRoles;
    }

    const calculatedScores = Object.values(headerScores);

    return apiResponse(
      res,
      200,
      true,
      "Feedback submitted successfully",
      calculatedScores,
      null,
    );
  } catch (error) {
    console.error(error);

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

    let targetFeedbackDoc = existingFeedback;
    let oldFeedbackDoc = null;

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
        // If feedback already exists for this header, we will merge into it
        targetFeedbackDoc = duplicateFeedback;
        oldFeedbackDoc = existingFeedback;
      } else {
        // Otherwise, rename the header of the existing document
        existingFeedback.header = targetHeader;
      }
    }

    if (questions !== undefined) {
      const currentQuestions = targetFeedbackDoc.questions.map((q) => ({
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
            // Patch existing question fields in the target document
            if (incomingQ.text !== undefined && incomingQ.text.trim()) {
              currentQuestions[existingIndex].text = incomingQ.text.trim();
            }
            if (incomingQ.is_reversed !== undefined) {
              currentQuestions[existingIndex].is_reversed =
                incomingQ.is_reversed;
            }
          } else {
            // If the question exists in another feedback document, pull it first (shift logic)
            const otherFeedback = await MentalTestFeedBackModel.findOne({
              "questions._id": incomingQ._id,
            });

            if (otherFeedback) {
              otherFeedback.questions = otherFeedback.questions.filter(
                (q) => q._id.toString() !== incomingQ._id.toString(),
              );

              // If no questions remain in the old document, soft-delete it
              if (otherFeedback.questions.length === 0) {
                otherFeedback.is_del = true;
              }

              await otherFeedback.save();
            }

            // Append to this feedback document
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

      targetFeedbackDoc.questions = currentQuestions;
    } else if (oldFeedbackDoc) {
      // If questions array is not provided but the header changed to an existing one,
      // move all questions from the old document to the target document
      const currentIds = new Set(targetFeedbackDoc.questions.map((q) => q._id.toString()));
      for (const q of oldFeedbackDoc.questions) {
        if (!currentIds.has(q._id.toString())) {
          targetFeedbackDoc.questions.push(q);
        }
      }
      oldFeedbackDoc.questions = [];
      oldFeedbackDoc.is_del = true;
      await oldFeedbackDoc.save();
    }

    const updatedFeedback = await targetFeedbackDoc.save();

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

  // Validate ID
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return apiResponse(res, 400, false, "Valid ID is required", null, null);
  }

  try {
    // 1. Check if ID matches a question ID within an active feedback document
    let feedbackDoc = await MentalTestFeedBackModel.findOne({
      "questions._id": id,
      is_del: false,
    });

    if (feedbackDoc) {
      // Pull the question from the questions array
      feedbackDoc.questions = feedbackDoc.questions.filter(
        (q) => q._id.toString() !== id,
      );

      // If it was the last question in the feedback document, soft-delete the document itself
      if (feedbackDoc.questions.length === 0) {
        feedbackDoc.is_del = true;
      }

      const response = await feedbackDoc.save();
      return apiResponse(
        res,
        200,
        true,
        feedbackDoc.is_del
          ? "Question deleted and empty feedback form soft-deleted successfully"
          : "Question deleted successfully from feedback form",
        response,
        null,
      );
    }

    // 2. If not found by question ID, check if the ID matches the parent feedback document itself
    feedbackDoc = await MentalTestFeedBackModel.findOne({
      _id: id,
      is_del: false,
    });

    if (feedbackDoc) {
      feedbackDoc.is_del = true;
      const response = await feedbackDoc.save();
      return apiResponse(
        res,
        200,
        true,
        "Feedback form soft-deleted successfully",
        response,
        null,
      );
    }

    return apiResponse(
      res,
      404,
      false,
      "Feedback form or question not found",
      null,
      null,
    );
  } catch (error) {
    console.error("Delete feedback/question error:", error);
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




// --- Configuration & Constants ---
const LIKERT_MAX_SCORE = 5;
const REVERSE_SCALE_BASE = LIKERT_MAX_SCORE + 1; // 6

const DEFAULT_PRIMARY_STYLE = {
  name: "Influence",
  descriptor: "Energizing but may need a detail-partner to close things out.",
};

const TRAIT_KEYWORD_MAP = [
  { keywords: ["openness"], code: "D" },
  { keywords: ["conscientiousness"], code: "C" },
  { keywords: ["extraversion"], code: "I" },
  { keywords: ["agreeableness"], code: "S" },
  { keywords: ["stability", "emotional", "well-being"], code: "S" },
];

/**
 * Maps header name to DISC style code (D, I, S, C)
 */
const getStyleCodeFromHeaderName = (headerName = "") => {
  const normalized = headerName.toLowerCase();
  const match = TRAIT_KEYWORD_MAP.find(({ keywords }) =>
    keywords.some((kw) => normalized.includes(kw))
  );
  return match ? match.code : "I";
};

// --- Controller Handler ---
export const getMentalTestFeedbackDetailsController = async (req, res) => {
  try {
    const userId = req.userId
    // const userId = `6a66f386e6b505694b13c270`

    if (!userId) {
      return apiResponse(res, 400, false, "User ID is required", null, null);
    }

    // 1. Fetch user attempts (lean mode for faster plain-JS performance)
    const attempts = await AttemptedMentalTestFeedbackModel.find({ user: userId })
      .populate("user", "name email phone")
      .lean();

    if (!attempts || attempts.length === 0) {
      return apiResponse(res, 400, false, "No feedback found", null, null);
    }

    // 2. Fetch active feedback templates
    const feedbackTemplates = await MentalTestFeedBackModel.find({ is_del: false })
      .populate("header")
      .lean();

    // 3. Build Question Map & Header Accumulator in a single pass
    const headerScoresMap = new Map();
    const questionMap = new Map();

    for (const template of feedbackTemplates) {
      if (!template.header) continue;

      const headerId = template.header._id.toString();
      const headerName = template.header.header;

      if (!headerScoresMap.has(headerId)) {
        headerScoresMap.set(headerId, {
          headerId,
          headerName,
          totalScore: 0,
          questionCount: 0,
        });
      }

      if (Array.isArray(template.questions)) {
        for (const question of template.questions) {
          questionMap.set(question._id.toString(), {
            headerId,
            headerName,
            text: question.text,
            is_reversed: Boolean(question.is_reversed),
          });
        }
      }
    }

    // 4. Format Attempts & Calculate Individual Question Scores
    const formattedAttempts = attempts.map((attempt) => {
      const qDetails = questionMap.get(attempt.questionId?.toString());
      const remarks = Number(attempt.remarks) || 0;

      if (qDetails) {
        const { headerId, text, is_reversed } = qDetails;
        const score = is_reversed ? REVERSE_SCALE_BASE - remarks : remarks;

        const headerObj = headerScoresMap.get(headerId);
        if (headerObj) {
          headerObj.totalScore += score;
          headerObj.questionCount += 1;
        }

        return {
          _id: attempt._id,
          questionId: attempt.questionId,
          text,
          remarks,
          score,
          is_reversed,
          createdAt: attempt.createdAt,
        };
      }

      return {
        _id: attempt._id,
        questionId: attempt.questionId,
        remarks,
        score: remarks,
        is_reversed: false,
        createdAt: attempt.createdAt,
      };
    });

    // 5. Compute Header Percentages and Identify Top Trait
    let highestHeader = null;

    const headerScores = Array.from(headerScoresMap.values()).map((headerObj) => {
      const maxPossibleScore = headerObj.questionCount * LIKERT_MAX_SCORE;
      const percentage =
        maxPossibleScore > 0
          ? Math.round((headerObj.totalScore / maxPossibleScore) * 100)
          : 0;

      const traitInfo = typeof getTraitInfo === "function"
        ? getTraitInfo(headerObj.headerName, percentage)
        : { level: "", characteristics: "", idealRoles: "" };

      const enrichedHeader = {
        ...headerObj,
        percentage,
        descriptor: traitInfo.level,
        workplaceCharacteristics: traitInfo.characteristics,
        idealFunctionalRoles: traitInfo.idealRoles,
      };

      if (
        !highestHeader ||
        percentage > highestHeader.percentage ||
        (percentage === highestHeader.percentage &&
          headerObj.totalScore > highestHeader.totalScore)
      ) {
        highestHeader = enrichedHeader;
      }

      return enrichedHeader;
    });

    // 6. Determine Primary Personality Style
    let primaryStyleName = DEFAULT_PRIMARY_STYLE.name;
    let descriptor = DEFAULT_PRIMARY_STYLE.descriptor;

    if (highestHeader) {
      const styleCode = getStyleCodeFromHeaderName(highestHeader.headerName);
      primaryStyleName =
        typeof FULL_NAME !== "undefined" && FULL_NAME[styleCode]
          ? FULL_NAME[styleCode]
          : DEFAULT_PRIMARY_STYLE.name;

      descriptor =
        typeof DESCRIPTORS !== "undefined" && DESCRIPTORS?.pronounced?.[styleCode]
          ? DESCRIPTORS.pronounced[styleCode]
          : DEFAULT_PRIMARY_STYLE.descriptor;
    }

    // 7. Send Standard Response
    return apiResponse(
      res,
      200,
      true,
      "Feedback details fetched and scores calculated successfully",
      {
        user: attempts[0].user,
        attempts: formattedAttempts,
        headerScores,
        createdAt: attempts[0].createdAt,
        highlighted: {
          headerName: highestHeader ? highestHeader.headerName : "",
          workplaceCharacteristics: highestHeader
            ? highestHeader.workplaceCharacteristics
            : "",
          idealFunctionalRoles: highestHeader
            ? highestHeader.idealFunctionalRoles
            : "",
        },
        primaryStyleName,
        descriptor,
      },
      null
    );
  } catch (error) {
    console.error("[getMentalTestFeedbackDetailsController] Exception:", error);

    return apiResponse(
      res,
      500,
      false,
      "Internal Server Error",
      null,
      error.message
    );
  }
};

