import User from "../models/userModel.js";
import companylist from "../models/CompanyListModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Employment from "../models/Employment.js";
import mongoose from "mongoose";
import nodemailer from "nodemailer";

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
    const { name, email, password, phone_number } = req.body;
    const role = 1;
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
    const role = 1;
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
    const { name, email, password, phone_number, cin_id, cin } = req.body;
    const role = 2;
    // Validate required fields
    if (!name || !email || !password || !phone_number || !cin) {
      return res.status(400).json({
        message: "Name, email, and password, phone_number cin are required",
      });
    }

    // Check if user already exists
    // const existingUser = await User.findOne({ cin_number: cin });
    // if (existingUser) {
    //   return res.status(400).json({ message: "User with this CIN number already exists" });
    // }

    const existingUser = await User.findOne({
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
      cin_number: cin,
      company_id: cin_id,
    });
    await newUser.save();
    const token = jwt.sign(
      { userId: newUser._id, companyId: newUser.company_id },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    // Email is start from here

    const employments = await Employment.find({
      companyName: cin_id,
      isDel: false,
      isVerified: false,
    }).lean();

    if (!employments || employments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found for this company",
      });
    }

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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.is_active === false || user.is_del === true) {
      return res.status(401).json({
        message:
          "Your account is deactivated or deleted. Please contact support.",
      });
    }

    // If password is hashed, compare using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    // If passwords don't match
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
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
    });
  } catch (error) {
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
