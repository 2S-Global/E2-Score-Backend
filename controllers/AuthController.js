import User from "../models/userModel.js";
import companylist from "../models/CompanyListModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Employment from "../models/Employment.js";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import dotenv from "dotenv";
import CompanyDetails from "../models/company_Models/companydetails.js";
dotenv.config();

/**
 * @function validtoken
 * @description Validates a user's token by checking if the user exists and is not deleted.
 * @param {Object} req - Express request object, expects userId attached to it.
 * @param {Object} res - Express response object used to send back the result.
 * @returns {void} Sends a JSON response indicating the validity of the token.
 * @throws {Error} If an error occurs during the token validation process.
 */
export const validtoken = async (req, res) => {
  try {
    const userId = req.userId;

    // Find user
    const user = await User.findById(userId);
    if (!user || user.is_del) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
        isvalid: false,
      });
    }
    return res.status(200).json({
      message: "Token is valid.",
      success: true,
      isvalid: true,
    });
  } catch (error) {
    console.error("Error while validating token:", error);
    return res.status(500).json({
      message: "An error occurred while validating the token.",
      success: false,
      isvalid: false,
    });
  }
};
// Register a new user
export const registerUser = async (req, res) => {
  try {
    dotenv.config();
    const { name, email, password, phone_number } = req.body;
    const role = 1;
    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email, is_del: false });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Formatting Phone Number
    const phoneNumber = parsePhoneNumberFromString(phone_number, "IN");

    if (!phoneNumber || !phoneNumber.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // ✅ Store in DB (E.164 format)
    const dbPhoneNumber = phoneNumber.number;

    // Create a new user with hashed password
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone_number: dbPhoneNumber,
    });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Send email with login credentials
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Access Credentials for Geisil",
      html: `
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
      
        <p>Your corporate account has been successfully created with the following credentials:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
      
       <p>Click the link  to verify your email: <a href="${process.env.BACKEND_URL}/api/auth/verify-email/${token}">Verify Email</a></p>
      
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

    res.status(201).json({
      success: true,
      message: "User registered and logged in successfully!",
      token,
      data: newUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};
// Register a new Institute
export const registerInstituteft = async (req, res) => {
  try {
    const { name, email, password, phone_number } = req.body;
    const role = 3;
    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user with hashed password
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone_number,
    });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Email Verification mail starts from here

    const transporterEmailVerification = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptionsEmailVerification = {
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
      `,
    };

    await transporterEmailVerification.sendMail(mailOptionsEmailVerification);

    res.status(201).json({
      success: true,
      message: "User registered and logged in successfully!",
      token,
      data: newUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

// Register a new company
export const registerCompany = async (req, res) => {
  try {
    const { name, email, password, phone_number, cin_id, cin, company_type } =
      req.body;
    const role = 2;
    // Validate required fields
    if (!name || !email || !password || !phone_number || !company_type) {
      return res.status(400).json({
        message:
          "Name , Email, Password, Phone Number and Company Type are required",
      });
    }

    // Check if user already exists
    // const existingUser = await User.findOne({ cin_number: cin });
    // if (existingUser) {
    //   return res.status(400).json({ message: "User with this CIN number already exists" });
    // }

    const existingUser = await User.findOne({
      is_del: false,
      $or: [{ email }, { cin_number: cin }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(404)
          .json({ message: "User with this email already exists" });
      }
      if (existingUser.cin_number === cin) {
        return res
          .status(404)
          .json({ message: "User with this CIN number already exists" });
      }
    }

    // companylist
    const company = await companylist.findOne({
      cinnumber: cin,
    });

    if (!company) {
      const companyData = new companylist({
        cinnumber: cin,
        companyname: name,
        companyemail: email,
        companyphone: phone_number,
      });
      await companyData.save();
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user with hashed password
    const newUser = new User({
      name,
      email,
      phone_number,
      password: hashedPassword,
      role,

      /* cin_number: cin,
      company_id: cin_id, */
    });
    await newUser.save();

    const companydetails = new CompanyDetails({
      userId: newUser._id,
      company_type: company_type,
      /*   cin_id: cin_id,
      cin: cin, */
      name: name,
      email: email,
      phone: phone_number,
    });
    await companydetails.save();

    const token = jwt.sign(
      { userId: newUser._id, companyId: newUser.company_id },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    // Email Verification mail starts from here

    const transporterEmailVerification = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptionsEmailVerification = {
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
      `,
    };

    await transporterEmailVerification.sendMail(mailOptionsEmailVerification);

    // Email Verification mail ends here

    // Email is start from here

    const employments = await Employment.find({
      companyName: cin_id,
      isDel: false,
      isVerified: false,
    }).lean();

    // if (!employments || employments.length === 0) {
    //   return;
    // }

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      token,
      /*  data: newUser, */
    });

    const userIds = [
      ...new Set(employments.map((emp) => emp.user.toString())),
    ].map((id) => new mongoose.Types.ObjectId(id));

    // 3. Fetch user details (name, photo)
    const users = await User.find(
      { _id: { $in: userIds }, is_del: false },
      {
        name: 1,
        email: 1,
        profilePicture: 1,
      }
    ).lean();

    // 6. Build result based on employments (not unique users)
    const result = employments.map((emp) => {
      const user = users.find((u) => u._id && u._id.equals(emp.user));

      return {
        userId: emp.user,
        name: user?.name || "N/A",
        email: user?.email || "N/A",
        photo: user?.profilePicture || null,
        jobTitle: emp.jobTitle || "Not Provided",
        employmentId: emp._id,
      };
    });

    if (result.length > 0) {
      // === EMAIL SENDING SECTION ===

      // Build HTML like LinkedIn job cards

      const employeeListHtml = result
        .map(
          (emp) => `
  <div style="display:flex; align-items:center; border:1px solid #ddd; border-radius:8px; padding:12px; margin-bottom:12px; background:#fff; font-family:Arial, sans-serif;">
    <img src="${emp.photo || "https://via.placeholder.com/50"}" 
         alt="profile" 
         style="width:50px; height:50px; border-radius:6px; object-fit:cover; margin-right:12px; border:1px solid #ccc;" />
    <div>
      <h3 style="margin:0; font-size:16px; color:#0073b1;">${
        emp.name || "N/A"
      }</h3>
      <p style="margin:4px 0 0 0; font-size:14px; font-weight:bold; color:#333;">${
        emp.jobTitle || "Unknown"
      }</p>
      <p style="margin:2px 0; font-size:13px; color:#555;">${
        emp.email || ""
      }</p>
    </div>
  </div>
`
        )
        .join("");

      const htmlTemplate = `
  <div style="max-width:600px; margin:auto; font-family:Arial, sans-serif; background:#f4f6f9; padding:20px;">
    <h2 style="color:#333; text-align:center;">Employees Associated with Your Company</h2>
    <p style="color:#555; text-align:center;">Here are the employees currently linked with your company record:</p>
    ${employeeListHtml}
    <p style="margin-top:20px; font-size:12px; color:#999; text-align:center;">
      If you think some information is incorrect, please contact support.
    </p>
  </div>
`;

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"E2Score Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Employment Verification Status Updated",
        html: htmlTemplate,
      };

      await transporter.sendMail(mailOptions);
    }

    // Email is end from here
    res.status(201).json({
      success: true,
      message: "User registered and logged in successfully!",
      token,
      /*  data: newUser, */
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

export const registerCompanyOld = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const role = 2;
    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user with hashed password
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      success: true,
      message: "User registered and logged in successfully!",
      token,
      /*  data: newUser, */
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};
// Register a new institute
export const registerInstitute = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const role = 3;
    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user with hashed password
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      success: true,
      message: "User registered and logged in successfully!",
      token,
      data: newUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

// Login a user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
      is_active: true,
      is_del: false,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials or account not active.",
        success: false,
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Your Email is not Verified.Please Verify it first.",
        success: false,
      });
    }

    // If password is hashed, compare using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    // If passwords don't match
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    let not_dashboard = false;
    if (user.role === 2) {
      const companydetails = await CompanyDetails.findOne({
        userId: user._id,
      }).populate({
        path: "company_type",
        select: "name Has_CIN",
      });

      //console.log("companydetails", companydetails.company_type.Has_CIN);

      if (companydetails?.company_type?.Has_CIN === true) {
        if (!companydetails.cin_id || companydetails.cin_id === null) {
          not_dashboard = true;
        }
      }
    }

    // Build payload
    // let payload = { userId: user._id };

    // If employer role, add companyId
    // if (user.role === 2 && user.company_id) {
    //   payload.companyId = user.company_id;
    // }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, companyId: user.company_id },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      data: user,
      role: user.role,
      not_dashboard,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error logging in user", error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email, is_del: false, is_active: true });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email" });
    }

    // Generate a new arbitrary password (e.g. 8 characters)
    const generatePassword = () => {
      const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#";
      let password = "";
      for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const newPassword = generatePassword();

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password in DB
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    // Send email with new password
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"E2Score Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Successful - Action Required",
      html: `<div style="text-align: center; margin-bottom: 20px;">
    <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/z17uasoek8vat5czluvg.jpg" alt="Banner" style="width: 100%; height: auto;" />
  </div>
              <h3>Dear ${user.name},</h3>
              <p>Your password has been successfully reset as per your request. Please find your new login credentials below:</p>
              <p><strong>New Password:</strong> ${newPassword}</p>
              <p>For your security, we strongly recommend that you log in immediately and change this password to something more personal and secure.</p>
              <p>
              If you did not request this password reset or have any concerns, please contact our support team right away.
              
              
              </p>
              <br/>
              <p>Stay secure,<br/>E2Score Team</p>
          `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "New password sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ message: "Error resetting password", error: error.message });
  }
};

// Verify-email
export const verifyEmail = async (req, res) => {
  const { token } = req.params;
  console.log("This is Token", token);

  const generateHTML = (title, heading, message, color) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f4f4f9;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .container {
          max-width: 500px;
          width: 90%;
          padding: 30px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          text-align: center;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 20px;
        }
        h1 {
          color: ${color};
          font-size: 24px;
          margin-bottom: 10px;
        }
        p {
          font-size: 16px;
          color: #333;
        }
        @media (max-width: 600px) {
          .container {
            padding: 20px;
          }
          h1 {
            font-size: 20px;
          }
          p {
            font-size: 14px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
       
        <h1>${heading}</h1>
        <p>${message}</p>
      </div>
    </body>
    </html>
  `;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .send(
          generateHTML(
            "Verification Failed",
            "User Not Found",
            "The user associated with this token does not exist.",
            "red"
          )
        );
    }

    if (user.isVerified) {
      return res
        .status(200)
        .send(
          generateHTML(
            "Email Already Verified",
            "You're Already Verified!",
            "Your email address has already been verified. You can log in now.",
            "green"
          )
        );
    }

    user.isVerified = true;
    await user.save();

    return res
      .status(200)
      .send(
        generateHTML(
          "Email Verified",
          "Success!",
          "Your email has been verified successfully. You can now access all features.",
          "#28a745"
        )
      );
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .send(
        generateHTML(
          "Invalid or Expired Token",
          "Verification Failed",
          "The verification link is invalid or has expired. Please try again or contact support.",
          "red"
        )
      );
  }
};

// Accept or Reject Interview Invitation
export const acceptRejectInterviewInvitation = async (req, res) => {
  const { token } = req.params;
  console.log("This is Token", token);

  const generateHTML = (title, heading, message, color) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f4f4f9;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .container {
          max-width: 500px;
          width: 90%;
          padding: 30px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          text-align: center;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 20px;
        }
        h1 {
          color: ${color};
          font-size: 24px;
          margin-bottom: 10px;
        }
        p {
          font-size: 16px;
          color: #333;
        }
        @media (max-width: 600px) {
          .container {
            padding: 20px;
          }
          h1 {
            font-size: 20px;
          }
          p {
            font-size: 14px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
       
        <h1>${heading}</h1>
        <p>${message}</p>
      </div>
    </body>
    </html>
  `;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .send(
          generateHTML(
            "Verification Failed",
            "User Not Found",
            "The user associated with this token does not exist.",
            "red"
          )
        );
    }

    if (user.isVerified) {
      return res
        .status(200)
        .send(
          generateHTML(
            "Email Already Verified",
            "You're Already Verified!",
            "Your email address has already been verified. You can log in now.",
            "green"
          )
        );
    }

    user.isVerified = true;
    await user.save();

    return res
      .status(200)
      .send(
        generateHTML(
          "Email Verified",
          "Success!",
          "Your email has been verified successfully. You can now access all features.",
          "#28a745"
        )
      );
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .send(
        generateHTML(
          "Invalid or Expired Token",
          "Verification Failed",
          "The verification link is invalid or has expired. Please try again or contact support.",
          "red"
        )
      );
  }
};
