import { parsePhoneNumberFromString } from "libphonenumber-js";
import User from "../../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

import nodemailer from "nodemailer";

// -------------------------------------------------------------
// ADD USER
// -------------------------------------------------------------
export const Adduser = async (req, res) => {
  try {
    const { name, email, phone_number, role } = req.body;

    if (!name || !email || !phone_number || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const validRoles = { 1: "Candidate", 2: "Company", 3: "Institute" };
    if (!validRoles[role]) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const normalizedPhone = phone_number.startsWith("+")
      ? phone_number
      : "+" + phone_number;

    const parsedPhone = parsePhoneNumberFromString(normalizedPhone);

    if (!parsedPhone?.isValid()) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const finalPhone = parsedPhone.number;

    const existingUser = await User.findOne({
      email,
      is_del: false,
      is_active: true,
    }).lean();

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
        role: existingUser.role,
      });
    }

    const password = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone_number: finalPhone,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    // Send email with login credentials
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // fixed typo
      port: process.env.EMAIL_PORT,
      secure: true, // true for port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    const mailOptions = {
      from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Access Credentials for Geisil",
      html: `
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/bx5dt5rz0zdmowryb0bz.jpg" alt="Banner" style="width: 100%; height: auto;" />
  </div>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Greetings from <strong>Global Employability Information Services India Limited</strong>.</p>
        <p>
          We are pleased to provide you with access to our newly launched platform,
          <a href="https://geisil.com/" target="_blank">https://geisil.com/</a>,
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
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      message: "User added successfully",
      debug: { name, email, phone: finalPhone, role, password },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// -------------------------------------------------------------
// UPDATE USER
// -------------------------------------------------------------
export const Updateuser = async (req, res) => {
  try {
    const { name, email, phone_number, _id } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!name || !email || !phone_number) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const normalizedPhone = phone_number.startsWith("+")
      ? phone_number
      : "+" + phone_number;

    const parsedPhone = parsePhoneNumberFromString(normalizedPhone);

    if (!parsedPhone?.isValid()) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const finalPhone = parsedPhone.number;

    // Check if email belongs to someone else
    const existingUser = await User.findOne({
      email,
      is_del: false,
      is_active: true,
      _id: { $ne: _id },
    }).lean();

    if (existingUser) {
      return res.status(400).json({
        message: "Email already taken by another user",
        role: existingUser.role,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        name,
        email,
        phone_number: finalPhone,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User updated successfully",
      debug: {
        name,
        email,
        phone: finalPhone,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
