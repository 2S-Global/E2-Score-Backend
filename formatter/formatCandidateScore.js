import { FULL_NAME, DESCRIPTORS } from "../utility/helper/discConstants.js";

export const formatCandidateScore = (attempt) => {
  if (!attempt) return null;

  const scores = attempt.scores || { D: 0, I: 0, S: 0, C: 0 };
  const total = scores.D + scores.I + scores.S + scores.C;

  const scoresPercentage = attempt.scoresPercentage || (total > 0 ? {
    D: Math.round((scores.D / total) * 1000) / 10,
    I: Math.round((scores.I / total) * 1000) / 10,
    S: Math.round((scores.S / total) * 1000) / 10,
    C: Math.round((scores.C / total) * 1000) / 10
  } : { D: 0, I: 0, S: 0, C: 0 });

  const primaryCode = attempt.result?.primaryStyle || "";
  const primaryStyleName = attempt.result?.primaryStyleName || FULL_NAME[primaryCode] || "";

  const secondaryCode = attempt.result?.secondaryStyle || "";
  const secondaryStyleName = attempt.result?.secondaryStyleName || FULL_NAME[secondaryCode] || "";

  const intensity = attempt.result?.intensity || "";
  const descriptor = attempt.result?.descriptor || (
    intensity === "Pronounced"
      ? DESCRIPTORS.pronounced[primaryCode]
      : DESCRIPTORS.normal[primaryCode]
  );
  
  return {
    attemptId: attempt._id,

    candidate: {
      id: attempt.userId?._id,
      name: attempt.userId?.name?.trim(),
      profilePicture: attempt.userId?.profilePicture,
    },

    scores,
    scoresPercentage,

    result: {
      totalQuestions: attempt.totalQuestions,
      status: attempt.status,
      primaryStyle: primaryCode,
      primaryStyleName,
      secondaryStyle: secondaryCode,
      secondaryStyleName,
      band: attempt.result?.band,
      gap: attempt.result?.gap,
      intensity: intensity,
      descriptor: descriptor
    },

    answers: (attempt.answers || []).map((answer) => {
      return {
        id: answer._id,
        question: {
          id: answer.questionId?._id,
          text: answer.questionId?.question,
        },
        selectedAnswer: answer.selectedOption,
        trait: answer.trait,
      };
    }),
  };
};



