import { parsePhoneNumberFromString } from "libphonenumber-js";
import User from "../../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

import nodemailer from "nodemailer";

import XLSX from "xlsx"; // ✅ default import so readFile works

import { sendUserCredentialsEmail } from "../../utility/Admin/Registrationemail.js";

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

    // Send email
    await sendUserCredentialsEmail(newUser, password);

    return res.status(201).json({
      message: "User added successfully",
      success: true,
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
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// -------------------------------------------------------------
// Excel import user
// -------------------------------------------------------------
export const importUser = async (req, res) => {
  try {
    const file = req.file;
    const { role } = req.body;

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const validRoles = { 1: "Candidate", 2: "Company", 3: "Institute" };
    if (!validRoles[role]) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const allowedMimeTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx ✔
      "application/vnd.ms-excel", // .xls ✔
      "text/csv", // .csv ✔
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        message:
          "Invalid file type. Only .xlsx, .xls, and .csv files are allowed.",
      });
    }

    // --------------------------------
    // Parse Excel File
    // --------------------------------
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const users = rows.map((row) => ({
      name: row.name?.toString().trim() || "",
      email: row.email?.toString().trim() || "",
      phone_number: row.phone ? row.phone.toString().trim() : "",
      role: Number(role),
    }));

    // --------------------------------
    // Audit logs
    // --------------------------------
    const audit = [];
    let createdCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    // --------------------------------
    // Process each imported user
    // --------------------------------
    for (let i = 0; i < users.length; i++) {
      const { name, email, phone_number } = users[i];

      const logEntry = {
        row: i + 2, // Excel row (header = row 1)
        name,
        email,
        phone_number,
        status: "pending",
        errors: [],
      };

      // ---- Field Validations ----
      if (!name) logEntry.errors.push("Name missing");
      if (!email) logEntry.errors.push("Email missing");
      if (!phone_number) logEntry.errors.push("Phone number missing");

      if (logEntry.errors.length) {
        logEntry.status = "invalid";
        audit.push(logEntry);
        invalidCount++;
        continue;
      }

      // ---- Email Format ----
      if (!validator.isEmail(email)) {
        logEntry.errors.push("Invalid email format");
        logEntry.status = "invalid";
        audit.push(logEntry);
        invalidCount++;
        continue;
      }

      // ---- Phone Validation ----
      const normalizedPhone = phone_number.startsWith("+")
        ? phone_number
        : "+" + phone_number;

      const parsedPhone = parsePhoneNumberFromString(normalizedPhone);

      if (!parsedPhone?.isValid()) {
        logEntry.errors.push("Invalid phone number");
        logEntry.status = "invalid";
        audit.push(logEntry);
        invalidCount++;
        continue;
      }

      const finalPhone = parsedPhone.number;

      // ---- Duplicate Check ----
      const existingUser = await User.findOne({
        email,
        is_del: false,
        is_active: true,
      }).lean();

      if (existingUser) {
        logEntry.errors.push("Email already exists");
        logEntry.status = "duplicate";
        audit.push(logEntry);
        duplicateCount++;
        continue;
      }

      // ---- Create User ----
      const password = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        name,
        email,
        phone_number: finalPhone,
        password: hashedPassword,
        role,
      });

      // ---- Send Email ----
      await sendUserCredentialsEmail(newUser, password);

      logEntry.status = "created";
      audit.push(logEntry);
      createdCount++;
    }

    // --------------------------------
    // Final response
    // --------------------------------
    return res.json({
      message: "Import completed",
      success: true,
      total: users.length,
      created: createdCount,
      duplicates: duplicateCount,
      invalid: invalidCount,
      audit,
    });
  } catch (error) {
    console.error("IMPORT ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
