import MentalTestQuizModel from "../../models/MentalTestQuiz.js";
import { FULL_NAME, DESCRIPTORS } from "./discConstants.js";


//Process answers submitted by the user and calculate raw DISC scores.

export const processAnswersAndScore = async (answers) => {
    const scores = {
        D: 0,
        I: 0,
        S: 0,
        C: 0
    };

    const processedAnswers = [];

    // Process every answer
    for (let i = 0; i < answers.length; i++) {
        const question = await MentalTestQuizModel.findOne({
            _id: answers[i].questionId,
            is_Deleted: false
        }).lean();

        if (!question) {
            return {
                success: false,
                status: 400,
                message: "Question not found"
            };
        }

        const selectedOption = answers[i].selectedOption;

        // Find selected option
        const selectedOptionData = question.options.find(
            (option) => option.text === selectedOption
        );

        if (!selectedOptionData) {
            return {
                success: false,
                status: 400,
                message: "Invalid option for question"
            };
        }

        // Get DISC trait
        const trait = selectedOptionData.trait;

        // Increase DISC score
        scores[trait]++;

        // Save processed answer
        processedAnswers.push({
            questionId: question._id,
            selectedOption: selectedOption,
            trait: trait
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




//Full DICS 
export const calculateDiscResult = (scores) => {
    // Sort DISC scores from highest to lowest
    const entries = Object.entries(scores);
    entries.sort((a, b) => b[1] - a[1]);

    const primaryCode = entries[0][0];
    const primaryCount = entries[0][1];

    const secondaryCode = entries[1][0];
    const secondaryCount = entries[1][1];

    // Calculate gap
    const gap = primaryCount - secondaryCount;

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

    // Calculate percentages
    const total = scores.D + scores.I + scores.S + scores.C;
    const scoresPercentage = total > 0 ? {
        D: Math.round((scores.D / total) * 1000) / 10,
        I: Math.round((scores.I / total) * 1000) / 10,
        S: Math.round((scores.S / total) * 1000) / 10,
        C: Math.round((scores.C / total) * 1000) / 10
    } : { D: 0, I: 0, S: 0, C: 0 };

    const primaryStyleName = FULL_NAME[primaryCode] || "";
    const secondaryStyleName = FULL_NAME[secondaryCode] || "";

    const descriptor = intensity === "Pronounced"
        ? DESCRIPTORS.pronounced[primaryCode]
        : DESCRIPTORS.normal[primaryCode];

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
        scoresPercentage
    };
};

//Response Formatter


export const formatAttemptResponse = (attempt) => {
    if (!attempt) return null;

    const scores = attempt.scores || { D: 0, I: 0, S: 0, C: 0 };
    const total = scores.D + scores.I + scores.S + scores.C;

    const scoresPercentage = attempt.scoresPercentage || (total > 0 ? {
        D: Math.round((scores.D / total) * 1000) / 10,
        I: Math.round((scores.I / total) * 1000) / 10,
        S: Math.round((scores.S / total) * 1000) / 10,
        C: Math.round((scores.C / total) * 1000) / 10
    } : { D: 0, I: 0, S: 0, C: 0 });

    const primaryCode = attempt.result?.primaryStyle || "D";
    const primaryStyleName = attempt.result?.primaryStyleName || FULL_NAME[primaryCode] || "Dominance";

    const secondaryCode = attempt.result?.secondaryStyle || "I";
    const secondaryStyleName = attempt.result?.secondaryStyleName || FULL_NAME[secondaryCode] || "Influence";

    const intensity = attempt.result?.intensity || "Balanced";
    const descriptor = attempt.result?.descriptor || (
        intensity === "Pronounced"
            ? DESCRIPTORS.pronounced[primaryCode]
            : DESCRIPTORS.normal[primaryCode]
    );

    return {
        _id: attempt._id,
        userId: attempt.userId,
        totalQuestions: attempt.totalQuestions,
        scores,
        scoresPercentage,
        primaryStyle: primaryCode,
        primaryStyleName,
        primaryCount: attempt.result?.primaryCount || 0,
        secondaryStyle: secondaryCode,
        secondaryStyleName,
        secondaryCount: attempt.result?.secondaryCount || 0,
        band: attempt.result?.band || "Moderate",
        gap: attempt.result?.gap || 0,
        intensity,
        descriptor,
        status: attempt.status,
        createdAt: attempt.createdAt
    };
};
