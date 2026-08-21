export const userCredentialsTemplate = (name, email, password, token) => `
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.EMAIL_HEADER_LOGO_URL || "https://services.geisil.com/assets/Logo-D7c9kIlT.webp"}" 
             alt="Banner" style="width: 100%; height: auto;" />
      </div>

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
         The Admin Team<br />
         <strong>Global Employability Information Services India Limited</strong>
      </p>

      <div style="text-align: center; margin-top: 30px;">
        <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" 
             alt="Footer" style="width:97px; height: 116px;" />
      </div>
`;
