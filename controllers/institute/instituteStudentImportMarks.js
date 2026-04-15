import csv from 'csv-parser';
import streamifier from 'streamifier';
import { InstitueStudent, InstitueStudentSemester } from "../../models/InstitueStudentModel.js";


export const processCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    streamifier.createReadStream(buffer)
      .pipe(csv())
      .on('data', (data) => {
        let rowData = data
        results.push({
          USN: rowData?.usn?.toLowerCase().trim(),
          semester: rowData['semester(number)'],
          marks: rowData?.marks?.toLowerCase().trim(),
          marksType: rowData?.["marks type"]?.toLowerCase().trim(),
          semesterYear: rowData?.["semester year"]?.toLowerCase().trim(),
          semesterMonth: rowData?.["semester month"]?.toLowerCase().trim(),
        });
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

function semesterValidation(v) {
  return /^[0-9]{1,2}$/.test(v)
}

/* if (!/^\d+(\.\d+)?$/.test(marks)) {
  return "Invalid number format";
} */

function marksValidation(v) {
  return /^([0-9]{1,2})(\.[0-9]{2})}$/.test(v)
}

//institute Student Import Marks

export const insStudentMarksImport = async (req, res) => {
  try {
    const { marksType, semesterYear, semesterMonth } = req.body;

    if (!marksType || !semesterYear || !semesterMonth) {
      return res.status(400).json({
        message: "marksType, semesterYear, and semesterMonth are required"
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const data = await processCSV(req.file.buffer); // use buffer instead of path
    // --------------------------------
    // Audit logs
    // --------------------------------
    const audit = [];
    let createdCount = 0;
    //let duplicateCount = 0;
    let invalidCount = 0;

    // --------------------------------
    // Process each imported user
    // --------------------------------
    for (let i = 0; i < data.length; i++) {
      const {
        USN,
        semester,
        marks,
      } = data[i];

      console.log(`Processing row ${i}: USN=${USN}, semester=${semester}, marks=${marks}, marksType=${marksType}, semesterYear=${semesterYear}, semesterMonth=${semesterMonth}`);

      const logEntry = {
        row: i + 2, // Excel row (header = row 1)
        USN,
        semester,
        marks,
        // marksType,
        // semesterYear,
        // semesterMonth,
        status: "pending",
        errors: [],
      };

      // ---- Field Validations ----
      if (!USN) logEntry.errors.push("USN missing");
      if (!semester) logEntry.errors.push("Semester missing");
      if (!marks) logEntry.errors.push("Marks missing");
      // if (!marksType) logEntry.errors.push("Marks type missing");
      // if (!semesterYear) logEntry.errors.push("Semester year missing");
      // if (!semesterMonth) logEntry.errors.push("Semester month missing");
      if (!semesterValidation(semester)) logEntry.errors.push("Invalid semester number format");

      if (logEntry.errors.length) {
        logEntry.status = "invalid";
        audit.push(logEntry);
        invalidCount++;
        continue;
      }
      //insert into DB
      const existingData = await InstitueStudent.findOne({
        USN,
        is_del: false,
      })

      await InstitueStudentSemester.findOneAndUpdate(
        { InstitueStudentId: existingData?._id, semester },
        { $set: { USN, semester, marks, marksType, semesterYear, semesterMonth } },
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