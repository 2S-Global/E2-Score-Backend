import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateFailedRequestsReportPDF = async (data) => {
  const templatePath = path.join(__dirname, "../templates/failedRequestsReport.ejs");

  const generatedDate = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata"
  });

  const htmlContent = await ejs.renderFile(templatePath, {
    ...data,
    generatedDate,
  });

  // Launch standard Puppeteer for local Windows environment
  const browser = await puppeteer.launch({
    headless: "new"
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "40px",
      bottom: "60px",
      left: "30px",
      right: "30px"
    },
    printBackground: true,
    displayHeaderFooter: true,
    footerTemplate: `
      <div style="
        width: 100%;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 8px;
        padding: 5px 30px;
        color: #64748b;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 0.5px solid #e2e8f0;
      ">
        <div>Failed API Requests Report &bull; Generated on \${generatedDate}</div>
        <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
      </div>
    `,
    headerTemplate: `<div></div>`
  });

  await page.close();
  await browser.close();
  return pdfBuffer;
};

export default generateFailedRequestsReportPDF;
