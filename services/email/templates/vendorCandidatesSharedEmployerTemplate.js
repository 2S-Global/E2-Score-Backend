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
    <p>We are pleased to inform you that <strong>${escapeHtml(vendorName)}</strong> has shared <strong>${escapeHtml(candidateCount)}</strong> candidate(s) with <strong>${escapeHtml(companyName)}</strong> for the <strong>${escapeHtml(jobTitle)}</strong> position.</p>
    <p>Kindly review the submitted profiles and consider the candidates based on your hiring requirements. If their qualifications and experience align with your expectations, your recruitment team may proceed with the next steps in the selection process.</p>
    <p>We look forward to your feedback.</p>
    <p>Best regards,<br /><strong>${escapeHtml(vendorName)}</strong></p>
  `);
