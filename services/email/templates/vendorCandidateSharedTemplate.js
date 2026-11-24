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
    <p>We are pleased to inform you that <strong>${escapeHtml(vendorName)}</strong> has shared your professional profile with <strong>${escapeHtml(companyName)}</strong> for the <strong>${escapeHtml(jobTitle)}</strong> position.</p>
    <p>The hiring team will review your profile, and if your qualifications and experience align with their requirements, they may contact you regarding the next steps in the recruitment process.</p>
    <p>Thank you for your interest and for considering this opportunity</p>
    <p>Best regards,<br /><strong>${escapeHtml(vendorName)}</strong></p>
  `);
