import csv from 'csv-parser';
import streamifier from 'streamifier';
import validator from 'validator';
import {InstitueStudent} from "../../models/InstitueStudentModel.js";
function convertDate(dateStr) {
  
  if(dateStr.includes('/')){
    dateStr.replace("/","-")
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
       let rowData=data
        results.push({
          name: rowData?.name?.toLowerCase().trim(),
          USN: rowData?.usn?.toLowerCase().trim(),
          program: rowData?.program?.toLowerCase().trim(),
          gender: rowData?.gender?.toLowerCase().trim(),
          dob: rowData?.dob,
          admissionYear: rowData?.admissionYear,
          tenTh: rowData['10th(marks)'],
          twelveTh: rowData['12th(marks)'],
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
   const user=req?.user
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
      const {name,
          USN,
          program,
          gender,
          dob,
          admissionYear,
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
      if (!tenTh) logEntry.errors.push("10TH marks missing.");
      if (!twelveTh) logEntry.errors.push("12TH marks missing.");
       if(!validateGender(gender))logEntry.errors.push("Only the gender values 'M', 'F', and 'O' are allowed.");
      if(!validator.isDate(dob, {
          format: 'DD-MM-YYYY',
          strictMode: true
        })) logEntry.errors.push("DOB not valid formate.");

       if(!year(admissionYear))logEntry.errors.push("Admission Year not valid formate.");

      if (logEntry.errors.length) {
        logEntry.status = "invalid";
        audit.push(logEntry);
        invalidCount++;
        continue;
      }
     let dobYMD=convertDate(dob)

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
        { USN , instituteId:user.userId},
        { $set: {name,USN,program,gender,dob:dobYMD,admissionYear,tenTh,twelveTh,instituteId:user.userId } },
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
  
}catch (err) {
    return res.status(500).json({
      message: 'Processing failed',
      error: err.message
    });
  }
};