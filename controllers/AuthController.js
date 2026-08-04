import User from "../models/userModel.js";
import companylist from "../models/CompanyListModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Employment from "../models/Employment.js";
import mongoose from "mongoose";
import { emailQueue } from "../queues/emailQueue.js";
import slugify from "slugify";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import dotenv from "dotenv";
import CompanyDetails from "../models/company_Models/companydetails.js";
import UserVerification from "../models/userVerificationModel.js";
import CandidateDetails from "../models/CandidateDetailsModel.js";
import personalDetails from "../models/personalDetails.js";
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
    const { name, email, password, phone_number, father_name, dob } = req.body;
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

    // Check if same name, father_name and dob already exist

    //mohan : wrong cause fathername isnt in the same table
    const duplicateUser = await User.findOne({
      name: name.trim(),
      father_name: father_name.trim(),
      dob,
      is_del: false,
    });

    if (duplicateUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
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
      profilePicture: null,
    });
    await newUser.save();
    await CandidateDetails.create({
      userId: newUser._id,
      fatherName: father_name,
      dob,
    });
    await personalDetails.create({
      user: newUser._id,
      visibility: {
        openToWork: true,
        showProfileInSearch: true,
      },
    });
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Send email with login credentials via queue
    await emailQueue.add("candidate_registration", {
      name,
      email,
      password,
      token,
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

    // Send institute registration email via queue
    await emailQueue.add("institute_registration", {
      name,
      email,
      password,
      token,
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
      /*
      if (existingUser.cin_number === cin) {
        return res
          .status(404)
          .json({ message: "User with this CIN number already exists" });
      }
      */
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

    const slugName = slugify(name, {
      lower: true,
      strict: true,
      trim: true,
    });
    const companyName = await companylist.findOne({
      slug: slugName,
    });
    if (!companyName) {
      const companyData = new companylist({
        companyname: name,
        companyemail: email,
        companyphone: phone_number,
        slug: slugName,
      });
      await companyData.save();
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const companyNameDetails = await companylist.findOne({
      slug: slugName,
    });
    // Create a new user with hashed password
    let newData = {
      name,
      email,
      phone_number,
      password: hashedPassword,
      role,

      /* cin_number: cin,
      company_id: cin_id, */
    };
    if (companyNameDetails) {
      newData = { ...newData, company_id: companyNameDetails?._id };
    }
    const newUser = new User(newData);

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
      },
    );

    // Email Verification mail starts from here

    // Send company registration email via queue
    await emailQueue.add("institute_registration", {
      name,
      email,
      password,
      token,
    });

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
      },
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
      <h3 style="margin:0; font-size:16px; color:#0073b1;">${emp.name || "N/A"
            }</h3>
      <p style="margin:4px 0 0 0; font-size:14px; font-weight:bold; color:#333;">${emp.jobTitle || "Unknown"
            }</p>
      <p style="margin:2px 0; font-size:13px; color:#555;">${emp.email || ""
            }</p>
    </div>
  </div>
`,
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

      // Send company associated employees email via queue
      await emailQueue.add("company_associated_employees", {
        email,
        employeeListHtml,
      });
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
        message: "Your Email is not Verified. Please verify it first.",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

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

      if (companydetails?.company_type?.Has_CIN === true) {
        if (!companydetails.cin_id) {
          not_dashboard = true;
        }
      }
    }

    // ✅ Generate token
    const token = jwt.sign(
      { userId: user._id, companyId: user.company_id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    // ✅ 1. Set cookie (for subdomains)
    res.cookie("token", token, {
      httpOnly: false,
      secure: true,
      sameSite: "None",
      domain: ".geisil.com",
      path: "/",
    });

    // ✅ 2. ALSO send token in response (for frontend/manual use)
    res.status(200).json({
      success: true,
      message: "Login successful!",
      token, // 👈 you still get it
      data: user,
      role: user.role,
      not_dashboard,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error logging in user",
      error: error.message,
    });
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
    // Send forgot password email via queue
    await emailQueue.add("forgot_password_company", {
      name: user.name,
      email,
      newPassword,
    });

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
            "red",
          ),
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
            "green",
          ),
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
          "#28a745",
        ),
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
          "red",
        ),
      );
  }
};

// Accept or Reject Interview Invitation
export const acceptRejectInterviewInvitation = async (req, res) => {
  const { token } = req.params;
  // console.log("This is Token", token);

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
            "red",
          ),
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
            "green",
          ),
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
          "#28a745",
        ),
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
          "red",
        ),
      );
  }
};

export const listCompaniesAll = async (req, res) => {
  try {
    // Get all companies (role: 1 and is_del: false)
    const companies = await User.find({
      is_del: false,
      role: 2,
    }).select("-password");

    if (!companies.length) {
      return res.status(404).json({ message: "No companies found" });
    }

    // Get order counts grouped by employer_id
    const orderCounts = await UserVerification.aggregate([
      { $match: { is_del: false } },
      { $group: { _id: "$employer_id", orderCount: { $sum: 1 } } },
    ]);

    // Convert orderCounts to a map for quick lookup
    const orderMap = {};
    orderCounts.forEach(({ _id, orderCount }) => {
      orderMap[_id.toString()] = orderCount;
    });

    // Attach order count to each company
    const companiesWithOrderCount = companies.map((company) => {
      const companyId = company._id.toString();
      return {
        ...company.toObject(),
        orderCount: orderMap[companyId] || 0,
      };
    });

    res.status(200).json({
      success: true,
      message: "Companies retrieved successfully",
      data: companiesWithOrderCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving companies",
      error: error.message,
    });
  }
};

// Get User Details Based on token
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //get profile picture from employer and institute cause except user no-one has profile picture in the user
    if (user.role === 2 || user.role === 3) {
      const companyDetails = await CompanyDetails.findOne({ userId })
        .select("logo")
        .lean();

      user.profilePicture = companyDetails?.logo || null;
    }

    console.log("Final user=======>", user);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Change Password API
export const changePassword = async (req, res) => {
  try {
    const userId = req.userId; // comes from auth middleware

    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user || user.is_del || !user.is_active) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Check old and new password same or not
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as current password",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: false,
      secure: true,
      sameSite: "None",
      domain: ".geisil.com",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};
