//import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateResumePDF = async (data) => {
  const templatePath = path.join(__dirname, "../templates/resume.ejs");

  // Added Today Started
  const defaultImagePath = path.join(__dirname, "../public/images/no_user.png");
  const defaultImageBase64 = fs
    .readFileSync(defaultImagePath)
    .toString("base64");
  const defaultImageDataUrl = `data:image/png;base64,${defaultImageBase64}`;

  const htmlContent = await ejs.renderFile(templatePath, {
    ...data,
    defaultImageDataUrl,
  });

  // const browser = await puppeteer.launch();
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    defaultViewport: chromium.defaultViewport,
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const generatedDate = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // show AM/PM
    timeZone: "Asia/Kolkata",
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "40px",
      bottom: "60px",
      left: "30px",
      right: "30px",
    },
    printBackground: true,
    displayHeaderFooter: true,
    footerTemplate: `
    <div style="
      width: 100%;
      font-size: 10px;
      padding: 5px 30px;
      color: #666;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 0.5px solid #ccc;
    ">
      <div>Generated on: ${generatedDate}</div>
      <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
    </div>
  `,
    headerTemplate: `<div></div>`, // empty header
  });
  await page.close();
  await browser.close();
  return pdfBuffer;
};

export default generateResumePDF;
