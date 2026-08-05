export const formatCandidateScore = (attempt) => {
  return {
    attemptId: attempt._id,

    candidate: {
      id: attempt.userId?._id,
      name: attempt.userId?.name?.trim(),
      profilePicture: attempt.userId?.profilePicture,
    },

    result: {
      totalQuestions: attempt.totalQuestions,
      correctAnswers: attempt.correctAnswers,
      wrongAnswers: attempt.wrongAnswers,
      score: attempt.score,
      status: attempt.status,
    },

    answers: attempt.answers.map((answer) => {
      const formattedAnswer = {
        id: answer._id,

        question: {
          id: answer.questionId?._id,
          text: answer.questionId?.question,
        },

        selectedAnswer: answer.selectedOption,
        isCorrect: answer.isCorrect,
      };

      if (!answer.isCorrect) {
        formattedAnswer.rightAnswer = answer.questionId?.correctOption;
      }

      return formattedAnswer;
    }),
  };
};