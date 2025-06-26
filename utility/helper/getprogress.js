import UserCareer from "../../models/CareerModel.js";
import Progress from "../../models/progressmodel.js";
import ResumeDetails from "../../models/resumeDetailsModels.js";
import Employment from "../../models/Employment.js";
import User from "../../models/userModel.js";
import personalDetails from "../../models/personalDetails.js";
import UserEducation from "../../models/userEducationModel.js";

export const GetProgress = async (userId) => {
  console.log("from helper", userId);
  let progress = 15;

  // Parallel DB queries
  const [career, resume, employment, user, personal, education] =
    await Promise.all([
      UserCareer.findOne({ userId, isDel: false }),
      ResumeDetails.findOne({ user: userId, isDel: false }),
      Employment.findOne({ user: userId, isDel: false }),
      User.findOne({ _id: userId, isDel: false }),
      personalDetails.findOne({ user: userId, isDel: false }),
      UserEducation.findOne({ userId, isDel: false }),
    ]);

  // Sections to fetch from Progress table
  const sections = [];

  if (career) {
    if (career.location?.length) sections.push("desired_job_location");
    if (career.CurrentDepartment?.length) sections.push("Department");
    if (career.CurrentIndustry?.length) sections.push("Industry type");
  }

  if (resume) {
    sections.push("resume");
  }

  if (employment) {
    sections.push("previous_company name and job title", "Job profile");
  }

  if (user?.profilePicture?.length) {
    sections.push("Upload photo");
  }

  if (personal) {
    sections.push("Personal details");

    if (personal.skills?.length) sections.push("Key skills");
    if (personal.resumeHeadline?.length) sections.push("Resume headline");
    if (personal.languageProficiency?.length)
      sections.push("Language proficiency");
    if (personal.profileSummary?.length) sections.push("Profile summary");
  }

  if (education) {
    sections.push("Education");
  }

  // Fetch all progress values in one DB call
  const progresses = await Progress.find({
    section_name: { $in: sections },
  });

  // Sum the progress values
  progresses.forEach((item) => {
    progress += item.progress_percentage;
  });

  return progress;
};
