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

export const vendorSubmitRequestTemplate = ({
  recipientName,
  jobTitle,
  candidateCount,
  requestId,
  branchName,
  companyName,
}) =>
  GeneralMailLayout(`
    <p>Dear <strong>${escapeHtml(recipientName)}</strong>,</p>
    <p>You have received a candidate request from <strong>${escapeHtml(companyName)}</strong> for <strong>${escapeHtml(jobTitle)}</strong>.</p>
    <p>Requested candidates: <strong>${escapeHtml(candidateCount)}</strong></p>
    <p>Sincerely,<br />${escapeHtml(companyName)}</p>
  `);
