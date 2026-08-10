import { formatCandidateScore } from "../../formatter/formatCandidateScore.js"
import MentalTestAttemptModel from "../../models/MentalTestAttempt.js"
import MentalTestQuizModel from "../../models/MentalTestQuiz.js"
import { apiResponse } from "../../utility/apiResponse.js"
import { createQuestionSchema } from "../../validation/createQuestion.js"
import { submitMentalTestValidation } from "../../validation/submitMentalTestValidation.js"
import {
    processAnswersAndScore,
    calculateDiscResult,
    formatAttemptResponse
} from "../../utility/helper/mentalTestHelper.js"



export const createMentalTestController = async (req, res) => {
    try {
        const isValid = createQuestionSchema.safeParse(req.body);

        if (!isValid.success) {
            return apiResponse(
                res,
                400,
                false,
                "Validation failed",
                null,
                isValid.error.issues[0].message
            );
        }

        const { question, options } = isValid.data;

        // Check whether question already exists
        const questionExist = await MentalTestQuizModel.findOne({
            question: question.trim(),
            is_Deleted: false
        });

        if (questionExist) {
            return apiResponse(
                res,
                400,
                false,
                "Question already exists",
                null,
                null
            );
        }

        // Create DISC question
        const response = await MentalTestQuizModel.create({
            question: question.trim(),
            options
        });

        return apiResponse(
            res,
            201,
            true,
            "Question created successfully",
            response,
            null
        );

    } catch (error) {
        return apiResponse(
            res,
            500,
            false,
            "Internal Server Error",
            null,
            error.message
        );
    }
}






export const getAllMentalTestQuestionsController = async (req, res) => {
    try {
        const response = await MentalTestQuizModel
            .find({
                is_Deleted: false
            })
            .select("question options _id")
            .lean();

        return apiResponse(
            res,
            200,
            true,
            "Questions fetched successfully",
            response,
            null
        );

    } catch (error) {
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





export const updateMentalTestQuestion = async (req, res) => {
    try {
        const { _id } = req.params;
        const isValid = createQuestionSchema.safeParse(req.body);

        if (!isValid.success) {
            return apiResponse(
                res,
                400,
                false,
                "Validation failed",
                null,
                isValid.error.issues[0].message
            );
        }

        const { question, options } = isValid.data;

        const questionExist = await MentalTestQuizModel.findById(_id);

        if (!questionExist || questionExist.is_Deleted) {
            return apiResponse(
                res,
                404,
                false,
                "Question not found",
                null,
                null
            );
        }

        const response = await MentalTestQuizModel
            .findByIdAndUpdate(
                _id,
                {
                    question: question.trim(),
                    options
                },
                {
                    new: true,
                    runValidators: true
                }
            )
            .select("question options _id")
            .lean();

        return apiResponse(
            res,
            200,
            true,
            "Question updated successfully",
            response,
            null
        );

    } catch (error) {
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


export const deleteMentalTestQuestion = async (req, res) => {
    try {
        const { _id } = req.params;

        const response = await MentalTestQuizModel.findOneAndUpdate(
            {
                _id,
                is_Deleted: false
            },
            {
                is_Deleted: true
            },
            {
                new: true
            }
        );

        if (!response) {
            return apiResponse(
                res,
                404,
                false,
                "Question not found",
                null,
                null
            );
        }

        return apiResponse(
            res,
            200,
            true,
            "Question deleted successfully",
            null,
            null
        );

    } catch (error) {
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





export const getAllCandidateScore = async (req, res) => {
    try {
        const attempts = await MentalTestAttemptModel.find({
            is_Deleted: false
        })
            .populate("userId", "name profilePicture")
            .populate("answers.questionId", "question")
            .select("-is_Deleted -createdAt -updatedAt -__v")
            .lean();

        if (!attempts) {
            return apiResponse(res, 404, false, "Attempt not found", null, null);
        }

        const formattedData = attempts.map(formatCandidateScore);

        return apiResponse(res, 200, true, "Attempt fetched successfully", formattedData, null);
    } catch (error) {
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





////////////////////////////////////////user APIS/////////////////////////////////////////////////




export const submitMentalTestController = async (req, res) => {
    try {
        const userId = req.userId;

        const isValid = submitMentalTestValidation.safeParse(req.body);
        
        if (!isValid.success) {
            return apiResponse(
                res,
                400,
                false,
                "Invalid Data",
                null,
                isValid.error.issues[0].message
            );
        }

        const { answers } = isValid.data;

        // Check whether user has already attempted the test
        const userAlreadyAttempt = await MentalTestAttemptModel.findOne({
            userId,
            is_Deleted: false
        });

        if (userAlreadyAttempt) {
            return apiResponse(
                res,
                400,
                false,
                "You have already attempted the test",
                null,
                null
            );
        }

        // Process answers and calculate raw scores
        const processResult = await processAnswersAndScore(answers);

        if (!processResult.success) {
            return apiResponse(
                res,
                processResult.status,
                false,
                processResult.message,
                null,
                null
            );
        }

        const { scores, processedAnswers } = processResult.data;

        // Calculate DISC analysis results
        const analysis = calculateDiscResult(scores);

        // Create attempt record
        const attempt = await MentalTestAttemptModel.create({
            userId,
            answers: processedAnswers,
            scores,
            scoresPercentage: analysis.scoresPercentage,
            result: {
                primaryStyle: analysis.primaryStyle,
                primaryStyleName: analysis.primaryStyleName,
                primaryCount: analysis.primaryCount,
                secondaryStyle: analysis.secondaryStyle,
                secondaryStyleName: analysis.secondaryStyleName,
                secondaryCount: analysis.secondaryCount,
                band: analysis.band,
                gap: analysis.gap,
                intensity: analysis.intensity,
                descriptor: analysis.descriptor
            },
            totalQuestions: processedAnswers.length,
            status: "completed"
        });

        if (!attempt) {
            return apiResponse(
                res,
                400,
                false,
                "Something went wrong",
                null,
                null
            );
        }

        const result = {
            userId: attempt.userId,
            totalQuestions: attempt.totalQuestions,
            scores: attempt.scores,
            scoresPercentage: attempt.scoresPercentage,
            primaryStyle: attempt.result.primaryStyle,
            primaryStyleName: attempt.result.primaryStyleName,
            primaryCount: attempt.result.primaryCount,
            secondaryStyle: attempt.result.secondaryStyle,
            secondaryStyleName: attempt.result.secondaryStyleName,
            secondaryCount: attempt.result.secondaryCount,
            band: attempt.result.band,
            gap: attempt.result.gap,
            intensity: attempt.result.intensity,
            descriptor: attempt.result.descriptor,
            status: attempt.status
        };

        return apiResponse(
            res,
            200,
            true,
            "DISC Test submitted successfully",
            result,
            null
        );

    } catch (error) {
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

export const getUserAttemptHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const attempts = await MentalTestAttemptModel.find({
            userId,
            is_Deleted: false
        }).lean();

        if (!attempts) {
            return apiResponse(res, 400, false, "Failed to fetch attempt history", null, null);
        }

        const response = attempts.map(formatAttemptResponse);

        return apiResponse(res, 200, true, "Attempt history fetched successfully", response, null);
    } catch (error) {
        return apiResponse(res, 500, false, "Internal Server Error", null, error.message);
    }
};

