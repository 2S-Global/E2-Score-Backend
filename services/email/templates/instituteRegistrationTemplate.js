export const instituteRegistrationTemplate = (name, email, password, token) => `
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/bx5dt5rz0zdmowryb0bz.jpg" alt="Banner" style="width: 100%; height: auto;" />
  </div>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Greetings from <strong>Global Employability Information Services India Limited</strong>.</p>
        <p>
          We are pleased to provide you with access to our newly launched platform,
          <a href="https://e2-score-updated.vercel.app" target="_blank">https://e2-score-updated.vercel.app</a>,
          <strong>Geisil</strong> is a comprehensive job and career platform designed for both candidates and companies. Candidates can register, update their professional profiles, and apply to job opportunities. Employers can sign in, post jobs, and verify candidates who have listed their company in their employment details. Institutes also have the ability to verify candidates in a similar way.
        </p>
      
        <p>Your corporate account has been successfully created with the following credentials:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
      
       <p>Click the link  to verify your email: <a href="${process.env.CLIENT_BASE_URL}/api/auth/verify-email/${token}">Verify Email</a></p>
      
        <p><strong>Key Features and Benefits of Geisil:</strong></p>
        <ul>
          <li>Job Search & Applications: Candidates can explore and apply to a wide range of job opportunities.</li>
          <li>Profile Management: Build and update a complete professional profile including education, skills, and work experience.</li>
          <li>Job Posting: Employers and institutes can post jobs and connect with qualified candidates.</li>
          <li>Candidate Verification: Companies and institutes can verify candidates who list them in their employment or education history.</li>
          <li>Seamless Communication: Easy interaction between candidates and employers for smoother recruitment.</li>
          <li>Secure Platform: Data protection and privacy ensured for both candidates and employers.</li>
        </ul>
      
        <p>
          We are confident that E2 Score will significantly improve your recruitment and job search experience by making the process faster, easier, and more reliable for both candidates and employers.
        </p>
      
        <p>
          For any assistance with the platform, including login issues or technical support, please contact our support team at:
        </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:info@geisil.com">info@geisil.com</a></li>
          <li><strong>Phone:</strong> 9831823898</li>
        </ul>
      
        <p>Thank you for choosing <strong>Global Employability Information Services India Limited</strong>.</p>
        <p>We look forward to supporting your Job Searching and Job Posting needs.</p>
      
        <br />
        <p>Sincerely,<br />
        The Admin Team<br />
        <strong>Global Employability Information Services India Limited</strong></p>

         <div style="text-align: center; margin-top: 30px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
    </div>
      `;
