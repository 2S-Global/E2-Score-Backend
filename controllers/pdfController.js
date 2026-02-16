import UserVerification from "../models/userVerificationModel.js";
import puppeteer from "puppeteer";
import cloudinary from "cloudinary";
import stream from "stream";
import OtpGeneratePDF from "./Helpers/otppdfHelper.js";
import User from "../models/userModel.js";
import chromium from "@sparticuz/chromium"; // Vercel-compatible Chromium
import GeneratePDF from "./Helpers/pdfHelper.js";

// Ensure Cloudinary is properly configured
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const generatePDF = async (req, res) => {
  try {
    const verifiedUsers = await UserVerification.find({ all_verified: 1 });

    console.log("Verified users found:", verifiedUsers);

    if (verifiedUsers.length === 0) {
      return res.status(404).json({ message: "No verified users found" });
    }

    let uploadedFiles = [];

    for (const user of verifiedUsers) {
      const userId = user._id.toString();
      const userName = user.candidate_name;

      // HTML content for the PDF
      const htmlContent = `
        <html>
        <head>
          <title>User Verification Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: blue; }
            p { font-size: 16px; }
          </style>
        </head>
        <body>
          <h1>Verification Report</h1>
          <p><strong>Name:</strong> ${userName}</p>
          <p><strong>User ID:</strong> ${userId}</p>
          <p><strong>Verification Status:</strong> Verified ✅</p>
        </body>
        </html>
      `;

      // Header and Footer Templates
      const headerTemplate = `
        <div style="font-size: 10px; width: 100%; text-align: center; padding: 5px; border-bottom: 1px solid #ccc;">
          <span>User Verification Report - ${userName}</span>
        </div>
      `;

      const footerTemplate = `
        <div style="font-size: 10px; width: 100%; text-align: center; padding: 5px; border-top: 1px solid #ccc;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `;

      // Launch Puppeteer
      const browser = await puppeteer.launch({ headless: "new" });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });

      // Generate PDF with Header & Footer
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate,
        footerTemplate,
        margin: {
          top: "40px",
          bottom: "40px",
        },
      });

      await browser.close();

      // Convert buffer to readable stream and pipe to Cloudinary
      const bufferStream = new stream.PassThrough();
      bufferStream.end(pdfBuffer);

      // Upload PDF to Cloudinary
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          {
            resource_type: "auto",
            // resource_type: "raw", // Ensures Cloudinary treats it as a file
            folder: "user_pdfs",
            public_id: `user_${userId}`,
            format: "pdf", // Ensures proper file extension
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              console.log("PDF uploaded successfully:", result.secure_url);
              uploadedFiles.push({
                userId,
                userName,
                pdfUrl: result.secure_url,
              });
              resolve(result);
            }
          }
        );

        bufferStream.pipe(uploadStream);
      });

      await uploadPromise; // Ensure each PDF uploads before proceeding
    }

    res.status(200).json({
      message: "PDFs generated and uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const generatePDFForEmployer = async (req, res) => {
  try {
    const order_id = req.body.order_id;
    console.log("Received order_id for PDF generation:", order_id);
    // Fetch the verified user
    const user = await UserVerification.findById(order_id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const company_details = await User.findById(user.employer_id).lean();
    if (!company_details) {
      return res.status(404).json({ message: "Company not found" });
    }
    const company_name = company_details.name;
    const userId = user._id.toString();
    const fileName = `${user.candidate_name}.pdf`;

    // Launch puppeteer using Vercel-compatible chromium
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();

    const htmlContent = GeneratePDF({ user });

    const headerTemplate = `
      <div style="width: 100%; text-align: center; font-size: 12px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
        <h2 style="margin: 0; color: #333;">2S GLOBAL TECHNOLOGIES LIMITED</h2>
<p style="margin: 0; font-size: 10px; line-height: 1.6;">
  Unit-404, 4th Floor, Webel IT Park (Phase-II),<br />
  Rajarhat, DH Block (Newtown), Action Area 1D,<br />
  Newtown, West Bengal 700160.
</p>

        <p style="margin: 0; font-size: 10px; line-height: 1.6;">support@quikchek.in | 00348101495</p>
      </div>
    `;
    const createdAt = new Date().toLocaleString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // for AM/PM format
      timeZone: "Asia/Kolkata",
    });

    const footerTemplate = `
    <div style="width: 100%; text-align: center; padding: 5px; font-size: 10px; border-top: 1px solid #ccc;">
      <p style="font-size: 10px; text-align: center; margin: 0;">This KYC verification is being done as per the request from "${company_name}" by GEISIL using Digilocker. The result is not</p>
      <p style="font-size: 10px; text-align: center; margin: 0;">for any promotional & commercial purposes. I agree to all Terms and Conditions. Created At: ${createdAt}</p>
      Page <span class="pageNumber"></span> of <span class="totalPages"></span>
    </div>
  `;

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      margin: {
        top: "120px",
        bottom: "40px",
      },
    });

    await page.close();
    await browser.close();

    // Set headers and send the PDF
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": pdfBuffer.length,
    });
    console.log("PDF generated successfully file name ," + fileName);

    return res.end(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const otpgeneratePDF = async (req, res) => {
  try {
    const order_id = req.body.order_id;

    // Fetch the verified user
    const user = await UserVerification.findById(order_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const company_details = await User.findById(user.employer_id).lean();
    if (!company_details) {
      return res.status(404).json({ message: "Company not found" });
    }
    const company_name = company_details.name;

    const userId = user._id.toString();
    const fileName = `${user.candidate_name}.pdf`;

    // Launch puppeteer using Vercel-compatible chromium
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();

    const htmlContent = OtpGeneratePDF({ user });

    const headerTemplate = `
      <div style="width: 100%; text-align: center; font-size: 12px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
        <h2 style="margin: 0; color: #333;">2S GLOBAL TECHNOLOGIES LIMITED</h2>
<p style="margin: 0; font-size: 10px; line-height: 1.6;">
  Unit-404, 4th Floor, Webel IT Park (Phase-II),<br />
  Rajarhat, DH Block (Newtown), Action Area 1D,<br />
  Newtown, West Bengal 700160.
</p>

        <p style="margin: 0; font-size: 10px; line-height: 1.6;">support@quikchek.in | 00348101495</p>
      </div>
    `;
    const createdAt = new Date().toLocaleString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // for AM/PM format
      timeZone: "Asia/Kolkata",
    });

    const footerTemplate = `
    <div style="width: 100%; text-align: center; padding: 5px; font-size: 10px; border-top: 1px solid #ccc;">
      <p style="font-size: 10px; text-align: center; margin: 0;">This KYC verification is being done as per the request from "${company_name}" by GEISIL using Digilocker. The result is not</p>
      <p style="font-size: 10px; text-align: center; margin: 0;">for any promotional & commercial purposes. I agree to all Terms and Conditions. Created At: ${createdAt}</p>
     
      Page <span class="pageNumber"></span> of <span class="totalPages"></span>
    </div>
  `;

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      margin: {
        top: "120px",
        bottom: "40px",
      },
    });

    await page.close();
    await browser.close();

    // Set headers and send the PDF
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": pdfBuffer.length,
    });
    console.log("PDF generated successfully file name ," + fileName);

    return res.end(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};