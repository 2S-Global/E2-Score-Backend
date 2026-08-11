import mongoose from "mongoose";
import AttemptedMentalTestFeedbackModel from "../../models/AttemptedMentalTestFeedbackModel.js";
import MentalTestFeedBackModel from "../../models/MentalTestFeedBackModel.js";
import { apiResponse } from "../../utility/apiResponse.js";
import MentalTestHeaderModel from "../../models/MentalTestHeaderModel.js";
import { submitMentalTestFeedbackValidation } from "../../validation/submitMentalTestFeedbackValidation.js";




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
                null
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
                    is_reversed: Boolean(question.is_reversed)
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
                null
            );
        }

        // Check if active feedback already exists for this header
        const existingFeedback = await MentalTestFeedBackModel.findOne({
            header,
            is_del: false
        });

        if (existingFeedback) {
            // Append only new questions that do not already exist in the existing document
            const existingQuestions = existingFeedback.questions || [];
            const existingTexts = new Set(
                existingQuestions.map((q) => q.text.trim().toLowerCase())
            );

            const newQuestions = cleanedQuestions.filter(
                (q) => !existingTexts.has(q.text.trim().toLowerCase())
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
                    null
                );
            }

            return apiResponse(
                res,
                200,
                true,
                "Questions already exist in the feedback for this header",
                existingFeedback,
                null
            );
        }

        // Create new feedback document
        const response = await MentalTestFeedBackModel.create({
            header,
            questions: cleanedQuestions
        });

        return apiResponse(
            res,
            201,
            true,
            "Feedback questions created successfully",
            response,
            null
        );

    } catch (error) {
        console.error(
            "Create Mental Test Feedback Error:",
            error
        );

        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            return apiResponse(
                res,
                409,
                false,
                "Feedback already exists for this header",
                null,
                null
            );
        }

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
                validation.error.issues[0].message
            );
        }

        const feedbacks = validation.data;
        console.log('the Feedback ==>', feedbacks);

        const alreadySubmitted = await AttemptedMentalTestFeedbackModel.exists({
            user: userId,
        });

        if (alreadySubmitted) {
            return apiResponse(
                res,
                400,
                false,
                "You have already submitted the feedback",
                null,
                null
            );
        }

        // Fetch active feedback templates to identify if questions are reversed and get their category/header
        const feedbackTemplates = await MentalTestFeedBackModel.find({ is_del: false }).populate("header");

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
                        questionCount: 0
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
                        is_reversed: question.is_reversed
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
                    null
                );
            }

            const { headerId, is_reversed } = qDetails;
            const remarks = feedback.remarks;

            // score logic: is_reversed = false -> remarks, is_reversed = true -> 6 - remarks
            const score = is_reversed ? (6 - remarks) : remarks;

            if (headerScores[headerId]) {
                headerScores[headerId].totalScore += score;
                headerScores[headerId].questionCount += 1;
            }

            dataToInsert.push({
                user: userId,
                questionId: feedback.questionId,
                remarks
            });
        }

        const savedResponses = await AttemptedMentalTestFeedbackModel.insertMany(dataToInsert);
        const calculatedScores = Object.values(headerScores);

        return apiResponse(res, 200, true, 'Feedback submitted successfully', calculatedScores, null);
    } catch (error) {
        console.error(error);

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
        }).populate("header", "header").select("header questions").sort({ createdAt: -1 })
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
    const { header, questions } = req.body;


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

    // Validate questions array if provided
    if (questions !== undefined) {
        if (!Array.isArray(questions) || questions.length === 0) {
            return apiResponse(
                res,
                400,
                false,
                "Questions array must be a non-empty array",
                null,
                null
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
                    null
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
                        null
                    );
                }
                if (question.text !== undefined && (typeof question.text !== "string" || !question.text.trim())) {
                    return apiResponse(
                        res,
                        400,
                        false,
                        "Question text must be a non-empty string",
                        null,
                        null
                    );
                }
                if (question.is_reversed !== undefined && typeof question.is_reversed !== "boolean") {
                    return apiResponse(
                        res,
                        400,
                        false,
                        "Question is_reversed must be a boolean",
                        null,
                        null
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
                        null
                    );
                }
                if (question.is_reversed !== undefined && typeof question.is_reversed !== "boolean") {
                    return apiResponse(
                        res,
                        400,
                        false,
                        "Question is_reversed must be a boolean",
                        null,
                        null
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
                null
            );
        }

        const targetHeader = header !== undefined ? header : existingFeedback.header;

        // Check if header is being updated and if the new header already has feedback
        if (header !== undefined && header.toString() !== existingFeedback.header.toString()) {
            const duplicateFeedback = await MentalTestFeedBackModel.findOne({
                header: targetHeader,
                is_del: false,
                _id: { $ne: id }
            });

            if (duplicateFeedback) {
                return apiResponse(
                    res,
                    400,
                    false,
                    "Feedback already exists for this header",
                    null,
                    null
                );
            }
        }

        if (header !== undefined) {
            existingFeedback.header = targetHeader;
        }

        if (questions !== undefined) {
            const currentQuestions = existingFeedback.questions.map(q => ({
                _id: q._id,
                text: q.text,
                is_reversed: q.is_reversed
            }));

            for (const incomingQ of questions) {
                if (incomingQ._id) {
                    const existingIndex = currentQuestions.findIndex(
                        q => q._id.toString() === incomingQ._id.toString()
                    );

                    if (existingIndex !== -1) {
                        // Patch existing question fields
                        if (incomingQ.text !== undefined && incomingQ.text.trim()) {
                            currentQuestions[existingIndex].text = incomingQ.text.trim();
                        }
                        if (incomingQ.is_reversed !== undefined) {
                            currentQuestions[existingIndex].is_reversed = incomingQ.is_reversed;
                        }
                    } else {
                        // If _id provided but not found, append as a new question
                        currentQuestions.push({
                            _id: incomingQ._id,
                            text: incomingQ.text ? incomingQ.text.trim() : "",
                            is_reversed: incomingQ.is_reversed !== undefined ? incomingQ.is_reversed : false
                        });
                    }
                } else {
                    // New question without _id
                    currentQuestions.push({
                        _id: new mongoose.Types.ObjectId(),
                        text: incomingQ.text.trim(),
                        is_reversed: incomingQ.is_reversed !== undefined ? incomingQ.is_reversed : false
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




export const getMentalTestFeedbackDetailsController = async (req, res) => {
    const userId = req.userId;

    try {
        const attempts = await AttemptedMentalTestFeedbackModel.find({
            user: userId
        }).populate("user", "name email phone");

        if (!attempts || attempts.length === 0) {
            return apiResponse(res, 400, false, "No feedback found", null, null);
        }

        // Fetch active feedback templates to identify if questions are reversed and get their category/header
        const feedbackTemplates = await MentalTestFeedBackModel.find({ is_del: false }).populate("header");

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
                        questionCount: 0
                    };
                }
            }
        }

        // Map questionId -> { headerId, headerName, text, is_reversed }
        const questionMap = new Map();
        for (const template of feedbackTemplates) {
            if (template.header) {
                const headerId = template.header._id.toString();
                const headerName = template.header.header;
                for (const question of template.questions) {
                    questionMap.set(question._id.toString(), {
                        headerId,
                        headerName,
                        text: question.text,
                        is_reversed: question.is_reversed
                    });
                }
            }
        }

        const formattedAttempts = [];

        for (const attempt of attempts) {
            const qDetails = questionMap.get(attempt.questionId.toString());
            if (qDetails) {
                const { headerId, text, is_reversed } = qDetails;
                const remarks = attempt.remarks;
                const score = is_reversed ? (6 - remarks) : remarks;

                if (headerScores[headerId]) {
                    headerScores[headerId].totalScore += score;
                    headerScores[headerId].questionCount += 1;
                }

                formattedAttempts.push({
                    _id: attempt._id,
                    questionId: attempt.questionId,
                    text,
                    remarks,
                    score,
                    is_reversed
                });
            } else {
                formattedAttempts.push({
                    _id: attempt._id,
                    questionId: attempt.questionId,
                    remarks: attempt.remarks,
                    score: attempt.remarks,
                    is_reversed: false
                });
            }
        }

        return apiResponse(
            res,
            200,
            true,
            "Feedback details fetched and scores calculated successfully",
            {
                user: attempts[0].user,
                attempts: formattedAttempts,
                headerScores: Object.values(headerScores)
            },
            null
        );
    } catch (error) {
        console.error(error);
        return apiResponse(res, 500, false, "Internal Server Error", null, error.message);
    }
}



