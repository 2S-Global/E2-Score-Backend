import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export const sendUserCredentialsEmail = async (user, password) => {
  const { name, email, _id } = user;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const token = jwt.sign({ userId: _id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  const mailOptions = {
    from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Access Credentials for Geisil",
    html: `
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/bx5dt5rz0zdmowryb0bz.jpg" 
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
    `,
  };

  await transporter.sendMail(mailOptions);
};
