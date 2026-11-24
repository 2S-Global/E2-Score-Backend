import { GeneralMailLayout } from "../../../utility/MailTeamplates.js";

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

export const vendorCandidateSharedTemplate = ({
  candidateName,
  vendorName,
  companyName,
  jobTitle,
}) =>
  GeneralMailLayout(`
    <p>Dear <strong>${escapeHtml(candidateName)}</strong>,</p>
    <p><strong>${escapeHtml(vendorName)}</strong> has shared your profile with <strong>${escapeHtml(companyName)}</strong> for the <strong>${escapeHtml(jobTitle)}</strong> position.</p>
    <p>The company may contact you if your profile matches its hiring needs.</p>
    <p>Best regards,<br /><strong>${escapeHtml(vendorName)}</strong></p>
  `);
