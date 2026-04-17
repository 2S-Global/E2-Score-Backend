import csv from 'csv-parser';
import streamifier from 'streamifier';
import validator from 'validator';
import { InstitueStudent } from "../../models/InstitueStudentModel.js";
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
      } = data[i];

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
      //insert into DB
      await InstitueStudent.findOneAndUpdate(
        { USN, instituteId: user.userId, admissionYear },
        { $set: { name, USN, program, gender, dob: dobYMD, admissionYear, tenTh, twelveTh, semester, instituteId: user.userId } },
        {
          upsert: true,
          new: true,
          runValidators: true
        }
      );

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

    console.log("Here is my User ID: ", user?.userId);

    const {
      name,
      USN,
      gender,
      dob,
      tenTh,
      twelveTh,
      program,
      semester,
      admissionYear,
    } = req.body;

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
      semester,
      status: "pending",
      errors: [],
    };

    // -----------------------------
    // Validations
    // -----------------------------
    if (!name) logEntry.errors.push("Name missing.");
    if (!USN) logEntry.errors.push("USN missing.");
    if (!program) logEntry.errors.push("Program missing.");
    if (!semester) logEntry.errors.push("Semester missing.");
    if (!gender) logEntry.errors.push("Gender missing.");
    if (!dob) logEntry.errors.push("DOB missing.");
    if (!admissionYear) logEntry.errors.push("Admission Year missing.");
    if (!tenTh) logEntry.errors.push("10TH(%) missing.");
    if (!twelveTh) logEntry.errors.push("12TH(%) marks missing.");

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
    console.log("Semester: ", semester);

    await InstitueStudent.findOneAndUpdate(
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
          program: new mongoose.Types.ObjectId(program), // ✅ FIX
          semester: Number(semester), // ✅ FIX
          admissionYear,
          instituteId: user.userId
        }
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );

    // -----------------------------
    // Success log
    // -----------------------------
    logEntry.status = "created";
    audit.push(logEntry);
    createdCount++;

    // -----------------------------
    // Final Response
    // -----------------------------
    return res.json({
      message: "Student saved successfully",
      success: true,
      created: createdCount,
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