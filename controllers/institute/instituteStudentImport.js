import csv from 'csv-parser';
import streamifier from 'streamifier';
import validator from 'validator';
import { InstitueStudent } from "../../models/InstitueStudentModel.js";
import { InstitueStudentSemester } from "../../models/InstitueStudentModel.js";
import { instituteStudentAvgMarks } from "../../controllers/institute/instituteStudentController.js";
import User from "../../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
function convertDate(dateStr) {

  if (dateStr.includes('/')) {
    dateStr.replace("/", "-")
  }
  const [d, m, y] = dateStr.split('-');
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}
function year(y) {
  return /^[1-9][0-9]{3}$/.test(y)
}

const validGenders = ["m", "f", "o"];

function validateGender(gender) {
  return validGenders.includes(gender?.toLowerCase());
}
export const processCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    streamifier.createReadStream(buffer)
      .pipe(csv())
      .on('data', (data) => {
        let rowData = data
        results.push({
          name: rowData?.name?.toLowerCase().trim(),
          USN: rowData?.usn?.toLowerCase().trim(),
          gender: rowData?.gender?.toLowerCase().trim(),
          dob: rowData?.dob,
          tenTh: rowData['10th(%)'],
          twelveTh: rowData['12th(%)'],
          email: rowData?.email,
          phoneNumber: rowData?.phoneNumber
        });
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};
//Institute Student Import
export const insStudentImport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }
    const user = req?.user
    const data = await processCSV(req.file.buffer); // use buffer instead of path
    // --------------------------------
    // Audit logs
    // --------------------------------
    const audit = [];
    let createdCount = 0;
    //let duplicateCount = 0;
    let invalidCount = 0;
    const { program, semester, admissionYear } = req.body;
    // --------------------------------
    // Process each imported user
    // --------------------------------
    for (let i = 0; i < data.length; i++) {
      const { name,
        USN,
        gender,
        dob,
        tenTh,
        twelveTh,
        email,
        phoneNumber
      } = data[i];

      console.log('Processing row: ', i + 2, data[i]);

      const logEntry = {
        row: i + 2, // Excel row (header = row 1)
        name,
        USN,
        program,
        gender,
        dob,
        admissionYear,
        tenTh,
        twelveTh,
        semester,
        email,
        phoneNumber,
        status: "pending",
        errors: [],
      };

      // ---- Field Validations ----
      if (!name) logEntry.errors.push("Name missing.");
      if (!USN) logEntry.errors.push("USN missing.");
      if (!program) logEntry.errors.push("Program missing.");
      if (!gender) logEntry.errors.push("Gender missing.");
      if (!dob) logEntry.errors.push("DOB missing.");
      if (!admissionYear) logEntry.errors.push("Admission Year missing.");
      if (!tenTh) logEntry.errors.push("10TH(%) missing.");
      if (!twelveTh) logEntry.errors.push("12TH(%) marks missing.");
      if (!validateGender(gender)) logEntry.errors.push("Only the gender values 'M', 'F', and 'O' are allowed.");
      // Email Validation
      if (!email) {
        logEntry.errors.push("Email missing.");
      } else if (!validator.isEmail(email)) {
        logEntry.errors.push("Invalid email format.");
      }

      // Phone Validation
      if (!phoneNumber) {
        logEntry.errors.push("Phone Number missing.");
      } else if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
        logEntry.errors.push(
          "Phone Number must be a valid 10-digit Indian mobile number."
        );
      }
      if (!validator.isDate(dob, {
        format: 'DD-MM-YYYY',
        strictMode: true
      })) logEntry.errors.push("DOB not valid formate.");

      if (!year(admissionYear)) logEntry.errors.push("Admission Year not valid formate.");

      if (logEntry.errors.length) {
        logEntry.status = "invalid";
        audit.push(logEntry);
        invalidCount++;
        continue;
      }
      let dobYMD = convertDate(dob)
      const currentYear = new Date().getFullYear();
      /*  // ---- Duplicate Check ----
       const existingUser = await InstitueStudent.findOne({
         USN,
         is_del: false,
       })
 
       if (existingUser) {
         logEntry.errors.push("Student already exists");
         logEntry.status = "duplicate";
         audit.push(logEntry);
         duplicateCount++;
         continue;
       } */

      // Check if email already exists in InstitueStudent
      const existingStudentEmail = await InstitueStudent.findOne({
        email: email.toLowerCase(),
        instituteId: user.userId
      });

      if (
        existingStudentEmail &&
        existingStudentEmail.USN !== USN
      ) {
        return res.status(400).json({
          success: false,
          message: "Student with this email already exists."
        });
      }

      //insert into DB
      const student =
        await InstitueStudent.findOneAndUpdate(
          { USN, instituteId: user.userId, admissionYear },
          { $set: { name, USN, program, gender, dob: dobYMD, admissionYear, tenTh, twelveTh, semester, email, phoneNumber, instituteId: user.userId, presentYear: currentYear, promotedYear: currentYear, promotedSemester: semester } },
          {
            upsert: true,
            new: true,
            runValidators: true
          }
        );

      logEntry.status = "created";
      audit.push(logEntry);
      createdCount++;

      // User Account Creation Starts from here

      // Check if user already exists
      const existingUser = await User.findOne({ email, is_del: false });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

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

      // Create a new user with hashed password
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: 1,
        phone_number: phoneNumber,
        usn: USN
      });
      await newUser.save();

      await InstitueStudent.findByIdAndUpdate(
        student._id,
        {
          $set: {
            userCreatedId: newUser._id
          }
        },
        { new: true }
      );

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
          <li><strong>Password:</strong> ${newPassword}</li>
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
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png%22 alt="Footer" style="width:97px; height: 116px;" />
    </div>
      `,
      };

      await transporter.sendMail(mailOptions);

    }

    // --------------------------------
    // Final response
    // --------------------------------
    return res.json({
      message: "Import completed",
      success: true,
      total: data.length,
      created: createdCount,
      invalid: invalidCount,
      audit
    });

  } catch (err) {
    return res.status(500).json({
      message: 'Processing failed',
      error: err.message
    });
  }
};

// Add Institute Student Manually
export const addInstituteStudentManually = async (req, res) => {
  try {
    const user = req?.user;
    const audit = [];
    const currentYear = new Date().getFullYear();
    console.log("Here is my User ID: ", user?.userId);

    const {
      name,
      USN,
      gender,
      dob,
      tenTh,
      twelveTh,
      program,
      semesters,
      admissionYear,
      email,
      phoneNumber,
    } = req.body;

    console.log("all data: ", req.body);

    let createdCount = 0;

    // -----------------------------
    // Audit log
    // -----------------------------
    const logEntry = {
      name,     // name
      USN,      // USN
      program,  // program
      gender,
      dob,
      admissionYear,
      tenTh,
      twelveTh,
      semesters,
      email,
      phoneNumber,
      status: "pending",
      errors: [],
    };

    // -----------------------------
    // Validations
    // -----------------------------
    if (!name) logEntry.errors.push("Name missing.");
    if (!USN) logEntry.errors.push("USN missing.");
    if (!program) logEntry.errors.push("Program missing.");
    // if (!semester) logEntry.errors.push("Semester missing.");
    if (!gender) logEntry.errors.push("Gender missing.");
    if (!dob) logEntry.errors.push("DOB missing.");
    if (!admissionYear) logEntry.errors.push("Admission Year missing.");
    if (!tenTh) logEntry.errors.push("10TH(%) missing.");
    if (!twelveTh) logEntry.errors.push("12TH(%) marks missing.");

    // Email Validation
    if (!email) {
      logEntry.errors.push("Email missing.");
    } else if (!validator.isEmail(email)) {
      logEntry.errors.push("Invalid email format.");
    }

    // Phone Validation
    if (!phoneNumber) {
      logEntry.errors.push("Phone Number missing.");
    } else if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      logEntry.errors.push(
        "Phone Number must be a valid 10-digit Indian mobile number."
      );
    }

    if (
      dob &&
      !validator.isDate(dob, {
        format: "DD-MM-YYYY",
        strictMode: true,
      })
    ) {
      logEntry.errors.push("DOB not valid format.");
    }

    if (!year(admissionYear)) {
      logEntry.errors.push("Admission Year not valid format.");
    }

    // Semesters validation
    if (!semesters || !Array.isArray(semesters)) {
      logEntry.errors.push("Semesters must be an array.");
    } else {
      semesters.forEach((sem) => {
        const key = Object.keys(sem)[0];
        const value = sem[key];

        if (!key || isNaN(key)) {
          logEntry.errors.push(`Invalid semester key: ${JSON.stringify(sem)}`);
        }
        if (!value || isNaN(value)) {
          logEntry.errors.push(`Invalid marks: ${JSON.stringify(sem)}`);
        }
      });
    }

    // -----------------------------
    // If invalid → return
    // -----------------------------
    if (logEntry.errors.length) {
      logEntry.status = "invalid";

      return res.status(400).json({
        message: "Validation failed",
        success: false,
        audit: logEntry,
      });
    }

    // -----------------------------
    // Transform Data
    // -----------------------------
    const dobYMD = convertDate(dob);

    console.log("USN: ", USN);
    console.log("Program: ", program);
    console.log("Semester: ", semesters);

    const existingData = await InstitueStudent.findOne({
      USN,
      instituteId: user.userId,
      admissionYear
    })

    // Check if email already exists in InstitueStudent
    const existingStudentEmail = await InstitueStudent.findOne({
      email: email.toLowerCase(),
      instituteId: user.userId
    });

    if (
      existingStudentEmail &&
      existingStudentEmail.USN !== USN
    ) {
      return res.status(400).json({
        success: false,
        message: "Student with this email already exists."
      });
    }

    const student = await InstitueStudent.findOneAndUpdate(
      {
        USN,
        instituteId: user.userId,
        admissionYear
      },
      {
        $set: {
          name,
          USN,
          gender,
          dob: dobYMD,
          tenTh,
          twelveTh,
          email,
          phoneNumber,
          program: new mongoose.Types.ObjectId(program), // ✅ FIX
          admissionYear,
          instituteId: user.userId,
          promotedYear: currentYear,
          promotedSemester: (existingData?.promotedSemester && existingData?.promotedSemester > semesters?.length) ? existingData?.promotedSemester : semesters?.length
        }
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );


    // -----------------------------
    // Handle Semesters
    // -----------------------------
    // Delete old semesters (important for update case)
    await InstitueStudentSemester.deleteMany({
      InstitueStudentId: student._id,
    });

    const semesterData = semesters.map((sem) => {
      const key = Object.keys(sem)[0];   // "1"
      const value = sem[key];            // "56"

      return {
        InstitueStudentId: student._id,
        semester: Number(key),
        marks: Number(value),
      };
    });

    let sem = await InstitueStudentSemester.insertMany(semesterData);

    if (sem) {
      let avgMarks = await instituteStudentAvgMarks(req?.user, student._id)
      console.log('avgMarks', avgMarks?.[0]?.averagePercentage);
      if (avgMarks?.[0]?.averagePercentage) {
        let res = await InstitueStudent.findOneAndUpdate(
          {
            USN,
            instituteId: user.userId,
            admissionYear
          },
          {
            $set: {
              graduationMarks: avgMarks?.[0]?.averagePercentage
            }
          },
          {
            upsert: true,
            new: true,
            runValidators: true
          }
        )
        console.log(res)
      }

    }



    // -----------------------------
    // Success log
    // -----------------------------
    logEntry.status = "created";
    audit.push(logEntry);
    createdCount++;

    // User Account Creation Starts from here

    // Check if user already exists
    const existingUser = await User.findOne({ email, is_del: false });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

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

    // Create a new user with hashed password
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 1,
      phone_number: phoneNumber,
      usn: USN
    });
    await newUser.save();

    await InstitueStudent.findByIdAndUpdate(
      student._id,
      {
        $set: {
          userCreatedId: newUser._id
        }
      },
      { new: true }
    );

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
          <li><strong>Password:</strong> ${newPassword}</li>
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
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png%22 alt="Footer" style="width:97px; height: 116px;" />
    </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // User Account Creation Ends here

    // -----------------------------
    // Final Response
    // -----------------------------
    return res.status(200).json({
      message: "Student & semesters saved successfully",
      success: true,
      created: createdCount,
      studentId: student._id,
      audit,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Processing failed",
      error: err.message,
    });
  }
};

// Delete Institute Student Manually
export const deleteInstituteStudent = async (req, res) => {
  try {
    const user = req?.user;

    const { id } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------
    if (!id) {
      return res.status(400).json({
        message: "Student id is required",
        success: false,
      });
    }

    // -----------------------------
    // Soft Delete
    // -----------------------------
    const student = await InstitueStudent.findOneAndUpdate(
      {
        _id: id,
        instituteId: user.userId,
        is_del: false
      },
      {
        $set: { is_del: true }
      },
      {
        new: true
      }
    );

    // -----------------------------
    // Not found
    // -----------------------------
    if (!student) {
      return res.status(404).json({
        message: "Student not found or already deleted",
        success: false,
      });
    }

    // -----------------------------
    // Success
    // -----------------------------
    return res.json({
      message: "Student deleted successfully",
      success: true,
      data: student,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Delete failed",
      error: err.message,
    });
  }
};