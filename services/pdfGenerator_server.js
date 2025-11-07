//import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateResumePDF = async (data) => {
  const templatePath = path.join(__dirname, "../templates/resume.ejs");
  const htmlContent = await ejs.renderFile(templatePath, { ...data });

  // const browser = await puppeteer.launch();
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    defaultViewport: chromium.defaultViewport,
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

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
    <div style="width: 100%; font-size: 10px; padding: 5px 0; text-align: center; color: #666;">
      Page <span class="pageNumber"></span> of <span class="totalPages"></span>
    </div>
  `,
    headerTemplate: `<div></div>`, // empty header
  });
  await page.close();
  await browser.close();
  return pdfBuffer;
};

export default generateResumePDF;