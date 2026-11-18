import { GeneralMailLayout } from "../../../utility/MailTeamplates.js";

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

export const vendorAssociationTemplate = (name, companyName) =>
  GeneralMailLayout(`
    <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
    <p><strong>${escapeHtml(companyName)}</strong> has added you as a vendor.</p>
    <p>You can continue using your existing GEISIL login details.</p>
    <p>Sincerely,<br />Global Employability Information Services India Limited</p>
  `);
