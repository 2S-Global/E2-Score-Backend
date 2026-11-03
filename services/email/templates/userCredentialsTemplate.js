import { GeneralMailLayout } from "../../../utility/MailTeamplates.js";
export const userCredentialsTemplate = (name, email, password, token) =>
  GeneralMailLayout(`


      <p>Dear <strong>${name}</strong>,</p>

      <p>Welcome to <strong>Geisil</strong> — your all-in-one job and career platform.</p>

      <p>Your login credentials:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      
      <p>Verify your email: 
        <a href="${process.env.CLIENT_BASE_URL}/api/auth/verify-email/${token}">
          Click here to verify
        </a>
      </p>

      <p>If you need help, contact:</p>
      <ul>
        <li>Email: info@geisil.com</li>
        <li>Phone: 9831823898</li>
      </ul>

      <br />
      <p>Sincerely,<br />
         Global Employability Information Services India Limited
      </p>

   
`);
