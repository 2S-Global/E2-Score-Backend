import {
  headsection,
  getPersonalDetails,
  getuseraccademicdetails,
  getKYC,
  getWorkSamples,
  getResearchPublication,
  getpresetation,
  listpatent,
  list_certificate,
  getCareerProfile,
  getEmploymentDetails,
  getProjectDetails,
} from "../../utility/candidatedetailshelper.js";
import User from "../../models/userModel.js";
import colors from "colors";

export const getCandidateDetailsV2 = async (req, res) => {
  const candidateId = req.query.candidateId;

  if (!candidateId) {
    return res.status(400).json({ message: "Candidate ID is required." });
  }

  try {
    // Fetch candidate details
    const user = await User.findById(candidateId)
      .select(
        "name profilePicture email phone_number address gender role createdAt updatedAt isVerified numberVerified "
      )
      .lean();
    if (!user || user.role !== 1) {
      return res.status(404).json({ message: "Candidate not found." });
    }
    console.log(
      `${"New Request for Candidate ID:".cyan.bold} ${
        String(candidateId).magenta
      }`
    );
    const timed = async (name, fn) => {
      const start = performance.now();
      const result = await fn();
      const end = performance.now();
      console.log(`${name} took: ${(end - start).toFixed(2)}ms`);
      return result;
    };

    /*  const [headsectiondata, personalData, academicDetails, kycData] =
      await Promise.all([
        headsection({ user_id: candidateId, user }),
        getPersonalDetails(candidateId, user),
        getuseraccademicdetails(candidateId),
        getKYC(candidateId),
      ]); */
    const [
      headsectiondata,
      personalData,
      academicDetails,
      kycData,
      Worklist,
      whitepaper,
      presentation,
      patent,
      certificate,
      careerProfile,
      employmentdata,
      projectData,
    ] = await Promise.all([
      timed("headsection", () => headsection({ user_id: candidateId, user })),
      timed("personalData", () => getPersonalDetails(candidateId, user)),
      timed("academicDetails", () => getuseraccademicdetails(candidateId)),
      timed("kycData", () => getKYC(candidateId)),
      timed("workSamples", () => getWorkSamples(candidateId)),
      timed("whitepaper", () => getResearchPublication(candidateId)),
      timed("presentation", () => getpresetation(candidateId)),
      timed("patents", () => listpatent(candidateId)),
      timed("certificate", () => list_certificate(candidateId)),
      timed("careerProfile", () => getCareerProfile(candidateId)),
      timed("employmentdata", () => getEmploymentDetails(candidateId)),
      timed("projectData", () => getProjectDetails(candidateId)),
    ]);

    /* for audit  */

    /* end of audit */
    res.status(200).json({
      message: "Candidate details fetched successfully.",
      success: true,
      data: {
        headsectiondata,
        kycData,
        personalData,
        academicDetails,
        Worklist,
        whitepaper,
        presentation,
        patent,
        certificate,
        careerProfile,
        employmentdata,
        projectData,
      },
      debug: {
        candidateId,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
