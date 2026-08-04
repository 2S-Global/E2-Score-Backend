export const instituteStudentImportCredentialsTemplate = (name, email, password) => `
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://res.cloudinary.com/da4unxero/image/upload/v1765884063/addacademics_asbt5b.jpg" alt="Banner" style="width: 100%; height: auto;" />
  </div>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Greetings from <strong>Global Employability Information Services India Limited</strong>.</p>
        <p>
          We are pleased to provide you with access to our newly launched platform,
          <a href="https://e2-score-updated.vercel.app" target="_blank">https://e2-score-updated.vercel.app</a>,
          <strong>Geisil</strong> is a comprehensive job and career platform designed for both candidates and companies. Candidates can register, update their professional profiles, and apply to job opportunities. Employers can sign in, post jobs, and verify candidates who have listed their company in their employment details. Institutes also have the ability to verify candidates in a similar way.
        </p>
      
        <p>Your candidate account has been successfully created with the following credentials:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
      
        <p>
          Please log in to the platform at 
          <a href="https://e2-score-updated.vercel.app" target="_blank">https://e2-score-updated.vercel.app</a> 
          using the provided credentials. We strongly recommend that you change your password
          upon your first login for security reasons.
        </p>
      
      
        <p>For any assistance with the platform, including login issues or technical support, please contact our support team at: </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:info@geisil.com">info@geisil.com</a></li>
          <li><strong>Phone:</strong> 9831823898</li>
        </ul>
      
        <p>Thank you for choosing <strong>Geisil India Limited</strong>.</p>
      
        <br />
        <p>Sincerely,<br />
        The Admin Team<br />
        <strong>Geisil India Limited</strong></p>
`;
