import { FULL_NAME, DESCRIPTORS } from "../utility/helper/discConstants.js";

export const formatCandidateScore = (attempt) => {
  if (!attempt) return null;

  const rawScores = attempt.scores || { D: 0, I: 0, S: 0, C: 0 };
  const total = rawScores.D + rawScores.I + rawScores.S + rawScores.C;

  const scores = {
    D: rawScores.D ?? 0,
    I: rawScores.I ?? 0,
    S: rawScores.S ?? 0,
    C: rawScores.C ?? 0,
    Dominance: rawScores.D ?? 0,
    Influence: rawScores.I ?? 0,
    Steadiness: rawScores.S ?? 0,
    Conscientiousness: rawScores.C ?? 0,
  };

  const rawPercentages = attempt.scoresPercentage || (total > 0 ? {
    D: Math.round((rawScores.D / total) * 1000) / 10,
    I: Math.round((rawScores.I / total) * 1000) / 10,
    S: Math.round((rawScores.S / total) * 1000) / 10,
    C: Math.round((rawScores.C / total) * 1000) / 10
  } : { D: 0, I: 0, S: 0, C: 0 });

  const scoresPercentage = {
    D: rawPercentages.D ?? 0,
    I: rawPercentages.I ?? 0,
    S: rawPercentages.S ?? 0,
    C: rawPercentages.C ?? 0,
    Dominance: rawPercentages.D ?? 0,
    Influence: rawPercentages.I ?? 0,
    Steadiness: rawPercentages.S ?? 0,
    Conscientiousness: rawPercentages.C ?? 0,
  };

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



