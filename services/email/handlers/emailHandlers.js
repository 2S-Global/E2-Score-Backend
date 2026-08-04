import { processDeleteMail } from "./actions/deleteMailHandler.js";
import { processAddMail } from "./actions/addMailHandler.js";
import { kycVerficationHandler } from "./actions/kycVerification.js";
import { addEmployeeDetailsHandler } from "./actions/addEmployeeDetails.js";
import { employmentAddedHandler } from "./actions/employmentAddedHandler.js";
import { employmentUpdatedHandler } from "./actions/employmentUpdatedHandler.js";
import { employmentDeletedHandler } from "./actions/employmentDeletedHandler.js";
import { personalDetailsUpdatedHandler } from "./actions/personalDetailsUpdatedHandler.js";
import { itskillAddedHandler } from "./actions/itskillAddedHandler.js";
import { itskillUpdatedHandler } from "./actions/itskillUpdatedHandler.js";
import { itskillDeletedHandler } from "./actions/itskillDeletedHandler.js";
import { otherskillAddedHandler } from "./actions/otherskillAddedHandler.js";
import { otherskillUpdatedHandler } from "./actions/otherskillUpdatedHandler.js";
import { otherskillDeletedHandler } from "./actions/otherskillDeletedHandler.js";
import { profilePictureUpdatedHandler } from "./actions/profilePictureUpdatedHandler.js";
import { resumeHeadlineUpdatedHandler } from "./actions/resumeHeadlineUpdatedHandler.js";
import { profileSummaryDeletedHandler } from "./actions/profileSummaryDeletedHandler.js";
import { profileUpdatedHandler } from "./actions/profileUpdatedHandler.js";
import { profileSummaryUpdatedHandler } from "./actions/profileSummaryUpdatedHandler.js";
import { keySkillsUpdatedHandler } from "./actions/keySkillsUpdatedHandler.js";
import { educationAddedHandler } from "./actions/educationAddedHandler.js";
import { educationUpdatedHandler } from "./actions/educationUpdatedHandler.js";
import { educationDeletedHandler } from "./actions/educationDeletedHandler.js";
import { careerProfileUpdatedHandler } from "./actions/careerProfileUpdatedHandler.js";
import { careerProfileAddedHandler } from "./actions/careerProfileAddedHandler.js";
import { onlineProfileAddedHandler } from "./actions/onlineProfileAddedHandler.js";
import { onlineProfileUpdatedHandler } from "./actions/onlineProfileUpdatedHandler.js";
import { onlineProfileDeletedHandler } from "./actions/onlineProfileDeletedHandler.js";
import { workSampleAddedHandler } from "./actions/workSampleAddedHandler.js";
import { workSampleUpdatedHandler } from "./actions/workSampleUpdatedHandler.js";
import { workSampleDeletedHandler } from "./actions/workSampleDeletedHandler.js";
import { researchPublicationAddedHandler } from "./actions/researchPublicationAddedHandler.js";
import { researchPublicationUpdatedHandler } from "./actions/researchPublicationUpdatedHandler.js";
import { researchPublicationDeletedHandler } from "./actions/researchPublicationDeletedHandler.js";
import { patentAddedHandler } from "./actions/patentAddedHandler.js";
import { patentUpdatedHandler } from "./actions/patentUpdatedHandler.js";
import { patentDeletedHandler } from "./actions/patentDeletedHandler.js";
import { certificateAddedHandler } from "./actions/certificateAddedHandler.js";
import { certificateUpdatedHandler } from "./actions/certificateUpdatedHandler.js";
import { certificateDeletedHandler } from "./actions/certificateDeletedHandler.js";
import { presentationAddedHandler } from "./actions/presentationAddedHandler.js";
import { presentationUpdatedHandler } from "./actions/presentationUpdatedHandler.js";
import { presentationDeletedHandler } from "./actions/presentationDeletedHandler.js";
import { resumeUploadedHandler } from "./actions/resumeUploadedHandler.js";
import { resumeDeletedHandler } from "./actions/resumeDeletedHandler.js";
import { projectUpdatedHandler } from "./actions/projectUpdatedHandler.js";
import { verificationTransactionHandler } from "./actions/verificationTransactionHandler.js";
import { applicationShortlistedHandler } from "./actions/applicationShortlistedHandler.js";
import { jobApplicationUpdateEmployerHandler } from "./actions/jobApplicationUpdateEmployerHandler.js";
import { jobApplicationCandidateHandler } from "./actions/jobApplicationCandidateHandler.js";
import { companyRegistrationHandler } from "./actions/companyRegistrationHandler.js";
import { contactSubmissionHandler } from "./actions/contactSubmissionHandler.js";
import { homePageContactHandler } from "./actions/homePageContactHandler.js";
import { candidateRegistrationHandler } from "./actions/candidateRegistrationHandler.js";
import { instituteRegistrationHandler } from "./actions/instituteRegistrationHandler.js";
import { companyAssociatedEmployeesHandler } from "./actions/companyAssociatedEmployeesHandler.js";
import { forgotPasswordHandler } from "./actions/forgotPasswordHandler.js";
import { companyPackageActivationHandler } from "./actions/companyPackageActivationHandler.js";
import { companyPackageActivationResendHandler } from "./actions/companyPackageActivationResendHandler.js";
import { adminE2scoreCredentialsHandler } from "./actions/adminE2scoreCredentialsHandler.js";
import { adminEmailUpdatedHandler } from "./actions/adminEmailUpdatedHandler.js";
import { instituteStudentImportCredentialsHandler } from "./actions/instituteStudentImportCredentialsHandler.js";
import { instituteStudentProfileCompletionHandler } from "./actions/instituteStudentProfileCompletionHandler.js";
import { instituteInterviewInvitationHandler } from "./actions/instituteInterviewInvitationHandler.js";
import { instituteRecruiterInterviewScheduleHandler } from "./actions/instituteRecruiterInterviewScheduleHandler.js";
import { instituteAcademicVerificationStatusHandler } from "./actions/instituteAcademicVerificationStatusHandler.js";
import { companyEmploymentVerificationStatusHandler } from "./actions/companyEmploymentVerificationStatusHandler.js";
import { companyJobApplicationsSummaryHandler } from "./actions/companyJobApplicationsSummaryHandler.js";
import { companyInterviewInvitationHandler } from "./actions/companyInterviewInvitationHandler.js";
import { companyInterviewRescheduledHandler } from "./actions/companyInterviewRescheduledHandler.js";
import { companyOfferLetterHandler } from "./actions/companyOfferLetterHandler.js";
import { companyOfferSentNotificationHandler } from "./actions/companyOfferSentNotificationHandler.js";
import { companyInterviewResponseHandler } from "./actions/companyInterviewResponseHandler.js";
import { companyOfferLetterResponseHandler } from "./actions/companyOfferLetterResponseHandler.js";
import { companyInterviewRescheduleRequestHandler } from "./actions/companyInterviewRescheduleRequestHandler.js";
import { userCredentialsHandler } from "./actions/userCredentialsHandler.js";
import { coverLetterUploadedHandler } from "./actions/coverLetterUpload.js";

//notification background JOBS

export const emailHandlers = {
    delete_mail: processDeleteMail,
    add_mail: processAddMail,
    kyc_verification: kycVerficationHandler,
    add_employee_details: addEmployeeDetailsHandler,
    employment_added: employmentAddedHandler,
    employment_updated: employmentUpdatedHandler,
    employment_deleted: employmentDeletedHandler,
    personal_details_updated: personalDetailsUpdatedHandler,
    itskill_added: itskillAddedHandler,
    itskill_updated: itskillUpdatedHandler,
    itskill_deleted: itskillDeletedHandler,
    otherskill_added: otherskillAddedHandler,
    otherskill_updated: otherskillUpdatedHandler,
    otherskill_deleted: otherskillDeletedHandler,
    profile_picture_updated: profilePictureUpdatedHandler,
    resume_headline_updated: resumeHeadlineUpdatedHandler,
    profile_summary_deleted: profileSummaryDeletedHandler,
    profile_updated: profileUpdatedHandler,
    profile_summary_updated: profileSummaryUpdatedHandler,
    keyskills_updated: keySkillsUpdatedHandler,
    education_added: educationAddedHandler,
    education_updated: educationUpdatedHandler,
    education_deleted: educationDeletedHandler,
    career_profile_updated: careerProfileUpdatedHandler,
    career_profile_added: careerProfileAddedHandler,
    online_profile_added: onlineProfileAddedHandler,
    online_profile_updated: onlineProfileUpdatedHandler,
    online_profile_deleted: onlineProfileDeletedHandler,
    work_sample_added: workSampleAddedHandler,
    work_sample_updated: workSampleUpdatedHandler,
    work_sample_deleted: workSampleDeletedHandler,
    research_publication_added: researchPublicationAddedHandler,
    research_publication_updated: researchPublicationUpdatedHandler,
    research_publication_deleted: researchPublicationDeletedHandler,
    patent_added: patentAddedHandler,
    patent_updated: patentUpdatedHandler,
    patent_deleted: patentDeletedHandler,
    certificate_added: certificateAddedHandler,
    certificate_updated: certificateUpdatedHandler,
    certificate_deleted: certificateDeletedHandler,
    presentation_added: presentationAddedHandler,
    presentation_updated: presentationUpdatedHandler,
    presentation_deleted: presentationDeletedHandler,
    resume_uploaded: resumeUploadedHandler,
    resume_deleted: resumeDeletedHandler,
    project_updated: projectUpdatedHandler,
    verification_transaction: verificationTransactionHandler,
    application_shortlisted: applicationShortlistedHandler,
    job_application_update_employer: jobApplicationUpdateEmployerHandler,
    job_application_candidate: jobApplicationCandidateHandler,
    company_registration: companyRegistrationHandler,
    contact_submission: contactSubmissionHandler,
    home_page_contact: homePageContactHandler,
    candidate_registration: candidateRegistrationHandler,
    institute_registration: instituteRegistrationHandler,
    company_associated_employees: companyAssociatedEmployeesHandler,
    forgot_password_company: forgotPasswordHandler,
    company_package_activation: companyPackageActivationHandler,
    company_package_activation_resend: companyPackageActivationResendHandler,
    admin_e2score_credentials: adminE2scoreCredentialsHandler,
    admin_email_updated: adminEmailUpdatedHandler,
    institute_student_import_credentials: instituteStudentImportCredentialsHandler,
    institute_student_profile_completion: instituteStudentProfileCompletionHandler,
    institute_interview_invitation: instituteInterviewInvitationHandler,
    institute_recruiter_interview_schedule: instituteRecruiterInterviewScheduleHandler,
    institute_academic_verification_status: instituteAcademicVerificationStatusHandler,
    company_employment_verification_status: companyEmploymentVerificationStatusHandler,
    company_job_applications_summary: companyJobApplicationsSummaryHandler,
    company_interview_invitation: companyInterviewInvitationHandler,
    company_interview_rescheduled: companyInterviewRescheduledHandler,
    company_offer_letter: companyOfferLetterHandler,
    company_offer_sent_notification: companyOfferSentNotificationHandler,
    company_interview_response: companyInterviewResponseHandler,
    company_offer_letter_response: companyOfferLetterResponseHandler,
    company_interview_reschedule_request: companyInterviewRescheduleRequestHandler,
    user_credentials_email: userCredentialsHandler,
    cover_letter_uploaded: coverLetterUploadedHandler
};

export default emailHandlers;
