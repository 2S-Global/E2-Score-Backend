import mongoose from "mongoose";
import AttemptedMentalTestFeedbackModel from "../../models/AttemptedMentalTestFeedbackModel.js";
import MentalTestFeedBackModel from "../../models/MentalTestFeedBackModel.js";
import { apiResponse } from "../../utility/apiResponse.js";
import MentalTestHeaderModel from "../../models/MentalTestHeaderModel.js";




export const createMentalTestFeedBackController = async (req, res) => {
    const { header, questions } = req.body;

    // Validate header
    if (!header || !mongoose.Types.ObjectId.isValid(header)) {
        return apiResponse(
            res,
            400,
            false,
            "Valid Header ID is required",
            null,
            null
        );
    }

    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
        return apiResponse(
            res,
            400,
            false,
            "Questions array is required",
            null,
            null
        );
    }



    // Validate every question
    const invalidQuestion = questions.some(
        (question) =>
            typeof question !== "string" || !question.trim()
    );

    if (invalidQuestion) {
        return apiResponse(
            res,
            400,
            false,
            "All questions must be non-empty strings",
            null,
            null
        );
    }

    try {
        // Remove extra spaces and duplicate questions
        const cleanedQuestions = [
            ...new Set(questions.map((question) => question.trim()))
        ];

        // Check which questions already exist and are not deleted
        const existingQuestions = await MentalTestFeedBackModel.find({
            header,
            question: { $in: cleanedQuestions },
            is_del: { $ne: true }
        }).select("question");

        const existingQuestionSet = new Set(
            existingQuestions.map((item) => item.question)
        );

        // Only insert new questions
        const newQuestions = cleanedQuestions
            .filter((question) => !existingQuestionSet.has(question))
            .map((question) => ({
                header,
                question
            }));

        if (newQuestions.length === 0) {
            return apiResponse(
                res,
                400,
                false,
                "All feedback questions already exist",
                null,
                null
            );
        }

        const response = await MentalTestFeedBackModel.insertMany(newQuestions);

        return apiResponse(
            res,
            200,
            true,
            `${response.length} feedback questions created successfully`,
            response,
            null
        );

    } catch (error) {
        console.log(error);

        return apiResponse(
            res,
            500,
            false,
            "Internal Server Error",
            null,
            error
        );
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
                null
            );
        }

        const userAlreadyGivenFeedback = await AttemptedMentalTestFeedbackModel.findOne({ user: userId });
        if (userAlreadyGivenFeedback) {
            return apiResponse(res, 400, false, "You have already submitted the feedback", null, null);
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
                    null
                );
            }

            if (remarks == null || remarks < 1 || remarks > 5) {
                return apiResponse(
                    res,
                    400,
                    false,
                    "Remarks must be in between 1 to 5",
                    null,
                    null
                );
            }
        }

        // Prepare data
        const data = feedbacks.map((feedback) => ({
            user: userId,
            questionId: feedback.questionId,
            remarks: feedback.remarks
        }));

        // Insert multiple documents
        const response =
            await AttemptedMentalTestFeedbackModel.insertMany(data);

        if (!response) {
            return apiResponse(
                res,
                400,
                false,
                "Failed to submit feedback",
                null,
                null
            );
        }

        return apiResponse(
            res,
            200,
            true,
            "Feedback submitted successfully",
            response,
            null
        );

    } catch (error) {
        console.log(error);

        return apiResponse(
            res,
            500,
            false,
            "Internal Server Error",
            null,
            error
        );
    }
};



export const getAllFeedBackForm = async (req, res) => {


    try {
        const feedback = await MentalTestFeedBackModel.find({
            is_del: false
        }).populate("header", "header").select("header question").sort({ createdAt: -1 })
        if (!feedback) {
            return apiResponse(res, 400, false, "Failed to get feedback", null, null)
        }
        return apiResponse(res, 200, true, "Feedback fetched successfully", feedback, null)
    } catch (error) {
        return apiResponse(res, 500, false, "Internal Server Error", null, error.message)
    }




}

export const getAllMentalTestHeader = async (req, res) => {

    try {
        const mentalTestHeader = await MentalTestHeaderModel.find().select("header")
        if (!mentalTestHeader) {
            return apiResponse(res, 400, false, "Failed to get mental test header", null, null)
        }
        return apiResponse(res, 200, true, "Mental test header fetched successfully", mentalTestHeader, null)
    } catch (error) {
        return apiResponse(res, 500, false, "Internal Server Error", null, error.message)
    }


}


export const updateMentalTestFeedBackController = async (req, res) => {
    const { id } = req.params;
    const { header, question } = req.body;


    // Validate feedback ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return apiResponse(
            res,
            400,
            false,
            "Valid Feedback ID is required",
            null,
            null
        );
    }

    // Validate header if provided
    if (header !== undefined && (!header || !mongoose.Types.ObjectId.isValid(header))) {
        return apiResponse(
            res,
            400,
            false,
            "Valid Header ID is required",
            null,
            null
        );
    }

    // Validate question if provided
    if (
        question !== undefined &&
        (typeof question !== "string" || !question.trim())
    ) {
        return apiResponse(
            res,
            400,
            false,
            "Question is required and must be a non-empty string",
            null,
            null
        );
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
                null
            );
        }

        const targetHeader = header !== undefined ? header : existingFeedback.header;
        const targetQuestion = question !== undefined ? question.trim() : existingFeedback.question;

        // Check whether another active question with same text
        // already exists under the same header
        const duplicateQuestion =
            await MentalTestFeedBackModel.findOne({
                _id: { $ne: id },
                header: targetHeader,
                question: targetQuestion,
                is_del: { $ne: true }
            });

        if (duplicateQuestion) {
            return apiResponse(
                res,
                400,
                false,
                "This feedback question already exists",
                null,
                null
            );
        }

        // Update feedback question
        const updatedFeedback =
            await MentalTestFeedBackModel.findByIdAndUpdate(
                id,
                {
                    header: targetHeader,
                    question: targetQuestion
                },
                {
                    new: true,
                    runValidators: true
                }
            );

        return apiResponse(
            res,
            200,
            true,
            "Feedback question updated successfully",
            updatedFeedback,
            null
        );

    } catch (error) {
        console.log(error);

        return apiResponse(
            res,
            500,
            false,
            "Internal Server Error",
            null,
            error
        );
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
            null
        );
    }

    try {
        const existing = await MentalTestFeedBackModel.findById(id);
        if (!existing) {
            return apiResponse(res, 404, false, "Feedback question not found", null, null);
        }
        if (existing.is_del) {
            return apiResponse(res, 400, false, "Feedback question is already deleted", null, null);
        }

        existing.is_del = true;
        const response = await existing.save();

        return apiResponse(res, 200, true, "Feedback question deleted successfully", response, null)

    } catch (error) {
        return apiResponse(res, 500, false, "Internal Server Error", null, error.message)
    }



}