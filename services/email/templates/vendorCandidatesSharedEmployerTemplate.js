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

export const vendorCandidatesSharedEmployerTemplate = ({
  employerName,
  vendorName,
  companyName,
  jobTitle,
  candidateCount,
}) =>
  GeneralMailLayout(`
    <p>Dear <strong>${escapeHtml(employerName)}</strong>,</p>
    <p><strong>${escapeHtml(vendorName)}</strong> has shared <strong>${escapeHtml(candidateCount)}</strong> candidate(s) with <strong>${escapeHtml(companyName)}</strong> for the <strong>${escapeHtml(jobTitle)}</strong> position.</p>
    <p>Best regards,<br /><strong>${escapeHtml(vendorName)}</strong></p>
  `);
