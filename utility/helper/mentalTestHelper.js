import MentalTestQuizModel from "../../models/MentalTestQuiz.js";
import {
    FULL_NAME,
    DESCRIPTORS,
    DISC_PROFILE_NAMES
} from "./discConstants.js";

const DEFAULT_SCORES = {
    D: 0,
    I: 0,
    S: 0,
    C: 0
};

const DISC_CODES = ["D", "I", "S", "C"];

/**
 * Process submitted answers and calculate raw DISC scores.
 */
export const processAnswersAndScore = async (answers) => {
    const scores = { ...DEFAULT_SCORES };
    const questionIds = answers.map((answer) => answer.questionId);

    // Fetch all questions in one query
    const questions = await MentalTestQuizModel.find({
        _id: { $in: questionIds },
        is_Deleted: false
    }).lean();

    // Create quick lookup map
    const questionMap = new Map(
        questions.map((question) => [
            question._id.toString(),
            question
        ])
    );

    const processedAnswers = [];

    for (const answer of answers) {
        const question = questionMap.get(
            answer.questionId.toString()
        );

        if (!question) {
            return {
                success: false,
                status: 400,
                message: "Question not found"
            };
        }

        const selectedOption = question.options.find(
            (option) => option.text === answer.selectedOption
        );

        if (!selectedOption) {
            return {
                success: false,
                status: 400,
                message: "Invalid option for question"
            };
        }

        const trait = selectedOption.trait;

        // Validate trait
        if (!DISC_CODES.includes(trait)) {
            return {
                success: false,
                status: 400,
                message: "Invalid DISC trait"
            };
        }

        scores[trait]++;

        processedAnswers.push({
            questionId: question._id,
            selectedOption: answer.selectedOption,
            trait
        });
    }

    return {
        success: true,
        data: {
            scores,
            processedAnswers
        }
    };
};


/**
 * Calculate final DISC result from raw scores.
 */
export const calculateDiscResult = (scores) => {
    const normalizedScores = {
        D: scores?.D ?? 0,
        I: scores?.I ?? 0,
        S: scores?.S ?? 0,
        C: scores?.C ?? 0
    };

    // Sort DISC styles by score
    const sortedStyles = Object.entries(normalizedScores)
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

    const [primaryCode, primaryCount] = sortedStyles[0];
    const [secondaryCode, secondaryCount] = sortedStyles[1];

    const gap = primaryCount - secondaryCount;

    const total = Object.values(normalizedScores)
        .reduce((sum, score) => sum + score, 0);

    // Band
    let band;

    if (primaryCount <= 4) {
        band = "Low";
    } else if (primaryCount <= 9) {
        band = "Moderate";
    } else {
        band = "High";
    }

    // Intensity
    let intensity;

    if (gap <= 2) {
        intensity = "Balanced";
    } else if (gap <= 5) {
        intensity = "Blended";
    } else {
        intensity = "Pronounced";
    }

    // Percentages
    const scoresPercentage = calculatePercentages(
        normalizedScores,
        total
    );

    // Profile
    const primaryStyleName = FULL_NAME[primaryCode] || "";
    const secondaryStyleName = FULL_NAME[secondaryCode] || "";

    const descriptor =
        intensity === "Pronounced"
            ? DESCRIPTORS.pronounced[primaryCode]
            : DESCRIPTORS.normal[primaryCode];

    // Hybrid / Pure
    const isHybrid = gap < 4;

    return {
        primaryStyle: primaryCode,
        primaryStyleName,
        primaryCount,

        secondaryStyle: secondaryCode,
        secondaryStyleName,
        secondaryCount,

        band,
        gap,
        intensity,

        descriptor,

        scoresPercentage,

        primaryProfile: DISC_PROFILE_NAMES[primaryCode],
        secondaryProfile: isHybrid
            ? DISC_PROFILE_NAMES[secondaryCode]
            : null,

        classification: isHybrid
            ? "Hybrid Profile"
            : "Pure Profile",

        dominanceMargin: gap
    };
};


/**
 * Calculate DISC percentages.
 */
const calculatePercentages = (scores, total) => {
    if (total === 0) {
        return { ...DEFAULT_SCORES };
    }

    return {
        D: Number(((scores.D / total) * 100).toFixed(1)),
        I: Number(((scores.I / total) * 100).toFixed(1)),
        S: Number(((scores.S / total) * 100).toFixed(1)),
        C: Number(((scores.C / total) * 100).toFixed(1))
    };
};


/**
 * Format attempt data for API response.
 *
 * This function only formats data.
 * It does NOT recalculate DISC logic.
 */
export const formatAttemptResponse = (attempt) => {
    if (!attempt) {
        return null;
    }

    const scores = {
        D: attempt.scores?.D ?? 0,
        I: attempt.scores?.I ?? 0,
        S: attempt.scores?.S ?? 0,
        C: attempt.scores?.C ?? 0,
        Dominance: attempt.scores?.D ?? 0,
        Influence: attempt.scores?.I ?? 0,
        Steadiness: attempt.scores?.S ?? 0,
        Conscientiousness: attempt.scores?.C ?? 0
    };

    const result = attempt.result || {};

    const rawPercentages = result.scoresPercentage ??
        calculatePercentages(
            scores,
            scores.D + scores.I + scores.S + scores.C
        );

    const scoresPercentage = {
        D: rawPercentages.D ?? 0,
        I: rawPercentages.I ?? 0,
        S: rawPercentages.S ?? 0,
        C: rawPercentages.C ?? 0,
        Dominance: rawPercentages.D ?? 0,
        Influence: rawPercentages.I ?? 0,
        Steadiness: rawPercentages.S ?? 0,
        Conscientiousness: rawPercentages.C ?? 0
    };

    return {
        _id: attempt._id,
        userId: attempt.userId,

        totalQuestions: attempt.totalQuestions,

        scores,

        scoresPercentage,

        primaryStyle: result.primaryStyle,
        primaryStyleName: result.primaryStyleName,
        primaryCount: result.primaryCount ?? 0,

        secondaryStyle: result.secondaryStyle,
        secondaryStyleName: result.secondaryStyleName,
        secondaryCount: result.secondaryCount ?? 0,

        band: result.band,
        gap: result.gap ?? 0,
        intensity: result.intensity,
        descriptor: result.descriptor,

        primaryProfile: result.primaryProfile,
        secondaryProfile: result.secondaryProfile,

        classification: result.classification,
        dominanceMargin: result.dominanceMargin ?? 0,

        status: attempt.status,
        createdAt: attempt.createdAt
    };
};