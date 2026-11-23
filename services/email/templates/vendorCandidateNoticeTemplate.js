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

export const vendorCandidateNoticeTemplate = (name, vendorName) =>
  GeneralMailLayout(`
    <p>Dear <strong>${escapeHtml(name)}</strong>,</p>

<p>
  We are pleased to inform you that
  <strong>${escapeHtml(vendorName)}</strong> has added your profile
  as a candidate through the GEISIL platform.
</p>

<p>
  We have included your profile in our candidate database to help you
  explore relevant job opportunities and employment prospects.
</p>

<p>
  You can sign in to your GEISIL account using your registered email address
  to review your profile and stay updated on relevant opportunities.
</p>

<p>
  If you have any questions regarding your profile or this notification,
  please contact us.
</p>

<p>
  Best regards,<br />
  <strong>${escapeHtml(vendorName)}</strong>
</p>
  `);
