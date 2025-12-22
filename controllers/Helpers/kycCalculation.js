import CandidateKYC from "../../models/CandidateKYCModel.js";

const kycCalculation = async (userId) => {
  if (!userId) {
    throw new Error("userId is required for KYC calculation");
  }

  const kyc = await CandidateKYC.findOne({ userId });

  if (!kyc) {
    throw new Error("Candidate KYC record not found");
  }

  // Document-wise calculation
  const docScores = {
    pan: kyc.pan_verified ? 2 : 1,
    aadhar: kyc.aadhar_verified ? 2 : 1,
    epic: kyc.epic_verified ? 2 : 1,
    passport: kyc.passport_verified ? 2 : 1,
    dl: kyc.dl_verified ? 2 : 1,
  };

  const totalScore = Object.values(docScores).reduce(
    (sum, val) => sum + val,
    0
  );



  return {
    userId,
    totalScore,
    maxScore: 10,
    breakdown: docScores,
  };
};

export default kycCalculation;