import { formatCandidateScore } from "../../formatter/formatCandidateScore.js";
import MentalTestAttemptModel from "../../models/MentalTestAttempt.js";
import MentalTestQuizModel from "../../models/MentalTestQuiz.js";
import { apiResponse } from "../../utility/apiResponse.js";
import { createQuestionSchema } from "../../validation/createQuestion.js";
import { submitMentalTestValidation } from "../../validation/submitMentalTestValidation.js";

export const createMentalTestController = async (req, res) => {
  try {
    // const userId = req.userId

    const isValid = createQuestionSchema.safeParse(req.body);
    if (!isValid.success) {
      return apiResponse(
        res,
        401,
        false,
        "Something went wrong",
        null,
        isValid.error.issues[0].message,
      );
    }
    const { question, options, correctOption } = isValid.data;

    const questionExist = await MentalTestQuizModel.findOne({ question });
    if (questionExist) {
      return apiResponse(
        res,
        400,
        false,
        "Question already exists",
        null,
        null,
      );
    }

    const response = await MentalTestQuizModel.create({
      question,
      options,
      correctOption,
    });
    if (!response) {
      return apiResponse(res, 401, false, "Something went wrong", null, null);
    }
    return apiResponse(
      res,
      200,
      true,
      "Question created successfully",
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

export const getAllMentalTestQuestionsController = async (req, res) => {
  try {
    const response = await MentalTestQuizModel.find({
      is_Deleted: false,
    })
      .select("question options _id correctOption")
      .lean();
    if (!response) {
      return apiResponse(res, 401, false, "Something went wrong", null, null);
    }
    return apiResponse(
      res,
      200,
      true,
      "Questions fetched successfully",
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

export const updateMentalTestQuestion = async (req, res) => {
  try {
    const { _id } = req.params;
    const { question, options, correctOption } = req.body;
    const questionExist = await MentalTestQuizModel.findOne({
      _id,
      is_Deleted: false,
    });
    if (!questionExist) {
      return apiResponse(res, 404, false, "Question not found", null, null);
    }

    const response = await MentalTestQuizModel.findByIdAndUpdate(
      _id,
      { question, options, correctOption },
      { new: true },
    )
      .select("question options _id")
      .lean();
    if (!response) {
      return apiResponse(res, 401, false, "Something went wrong", null, null);
    }
    return apiResponse(
      res,
      200,
      true,
      "Question updated successfully",
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

export const deleteMentalTestQuestion = async (req, res) => {
  try {
    const { _id } = req.params;

    const response = await MentalTestQuizModel.findByIdAndUpdate(
      _id,
      { is_Deleted: true },
      { new: true },
    );
    if (!response) {
      return apiResponse(res, 400, false, "Something went wrong", null, null);
    }
    return apiResponse(
      res,
      200,
      true,
      "Question deleted successfully",
      null,
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

export const getAllCandidateScore = async (req, res) => {
  const attempt = await MentalTestAttemptModel.find({
    is_Deleted: false,
  })
    .lean()
    .populate("userId", "name profilePicture")
    .populate("answers.questionId", "question correctOption")
    .select("-is_Deleted -createdAt -updatedAt -__v")
    .lean();

  const formattedData = attempt.map(formatCandidateScore);
  if (!attempt) {
    return apiResponse(res, 401, false, "Attempt not found", null, null);
  }

  return apiResponse(
    res,
    200,
    true,
    "Attempt fetched successfully",
    formattedData,
    null,
  );
};

////////////////////////////////////////user APIS/////////////////////////////////////////////////

export const submitMentalTestController = async (req, res) => {
  try {
    const userId = req.userId;
    const isValid = submitMentalTestValidation.safeParse(req.body);
    console.log("zod validation Check", JSON.stringify(isValid, null, 2));
    if (!isValid.success) {
      return apiResponse(
        res,
        401,
        false,
        "Invalid Data",
        null,
        isValid.error.issues[0].message,
      );
    }

    const { answers } = isValid.data;

    const userAlreadyAttempt = await MentalTestAttemptModel.findOne({
      userId,
      is_Deleted: false,
    });

    if (userAlreadyAttempt) {
      return apiResponse(
        res,
        400,
        false,
        "You have already attempted the test",
        null,
        null,
      );
    }

    let score = 0;
    let correctAnswer = 0;
    let wrongAnswer = 0;
    let processedAnswers = [];

    for (let i = 0; i < answers.length; i++) {
      const question = await MentalTestQuizModel.findOne({
        _id: answers[i].questionId,
        is_Deleted: false,
      }).lean();

      if (!question) {
        return apiResponse(res, 400, false, "Question not found", null, null);
      }

      const selectedOption = answers[i].selectedOption;

      if (!question.options.includes(selectedOption)) {
        return apiResponse(
          res,
          400,
          false,
          `Invalid option for question.`,
          null,
          null,
        );
      }

      const isCorrect = question.correctOption === answers[i].selectedOption;

      if (isCorrect) {
        score++;
        correctAnswer++;
      } else {
        wrongAnswer++;
      }

      processedAnswers.push({
        questionId: question._id,
        selectedOption: selectedOption,
        isCorrect: isCorrect,
      });
    }

    const attempt = await MentalTestAttemptModel.create({
      userId,
      answers: processedAnswers,
      totalQuestions: processedAnswers.length,
      correctAnswers: correctAnswer,
      wrongAnswers: wrongAnswer,
      score: score,
      status: "completed",
    });
    if (!attempt) {
      return apiResponse(res, 400, false, "Something went wrong", null, null);
    }

    const result = {
      userId: attempt.userId,
      totalQuestions: attempt.totalQuestions,
      correctAnswers: attempt.correctAnswers,
      wrongAnswers: attempt.wrongAnswers,
      score: attempt.score,
      status: attempt.status,
    };

    return apiResponse(
      res,
      200,
      true,
      "Mental Test submitted successfully",
      result,
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

export const getUserAttemptHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const response = await MentalTestAttemptModel.find({
      userId,
      is_Deleted: false,
    })
      .select("totalQuestions correctAnswers wrongAnswers score")
      .lean();
    if (!response) {
      return apiResponse(res, 401, false, "Something went wrong", null, null);
    }
    return apiResponse(
      res,
      200,
      true,
      "Questions fetched successfully",
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
